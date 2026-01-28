import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, taskId, notes, photoUrl } = await request.json();

    // Validate inputs
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    // Verify the task exists and get the StayKit ID
    const { data: task, error: taskError } = await supabase
      .from('staykit_tasks')
      .select(`
        id,
        day:staykit_days!inner (
          id,
          staykit_id
        )
      `)
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskData = task as any;
    const staykitId = Array.isArray(taskData.day) ? taskData.day[0].staykit_id : taskData.day.staykit_id;

    // Verify user has access to this StayKit
    const { data: access } = await supabase
      .from('customer_product_access')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', staykitId)
      .eq('product_type', 'staykit')
      .maybeSingle();

    if (!access) {
      return NextResponse.json({ error: 'User does not have access to this StayKit' }, { status: 403 });
    }

    // Check if task is already completed
    const { data: existing } = await supabase
      .from('user_task_completion')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Task already completed' }, { status: 409 });
    }

    // Mark task as complete
    const { data: completion, error: completionError } = await supabase
      .from('user_task_completion')
      .insert({
        user_id: userId,
        task_id: taskId,
        completed_at: new Date().toISOString(),
        notes: notes || null,
        photo_url: photoUrl || null,
      })
      .select()
      .single();

    if (completionError) {
      console.error('Error completing task:', completionError);
      return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }

    // Update user progress
    await updateUserProgress(userId, staykitId);

    return NextResponse.json({
      success: true,
      completion,
    });
  } catch (error) {
    console.error('Error in complete-task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, taskId } = await request.json();

    // Validate inputs
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    // Get the StayKit ID for progress update
    const { data: task } = await supabase
      .from('staykit_tasks')
      .select(`
        id,
        day:staykit_days!inner (
          id,
          staykit_id
        )
      `)
      .eq('id', taskId)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskData = task as any;
    const staykitId = Array.isArray(taskData.day) ? taskData.day[0].staykit_id : taskData.day.staykit_id;

    // Delete the completion record
    const { error: deleteError } = await supabase
      .from('user_task_completion')
      .delete()
      .eq('user_id', userId)
      .eq('task_id', taskId);

    if (deleteError) {
      console.error('Error uncompleting task:', deleteError);
      return NextResponse.json({ error: 'Failed to uncomplete task' }, { status: 500 });
    }

    // Update user progress
    await updateUserProgress(userId, staykitId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in uncomplete-task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateUserProgress(userId: string, staykitId: string) {
  // Get all day IDs for this StayKit
  const { data: days } = await supabase
    .from('staykit_days')
    .select('id')
    .eq('staykit_id', staykitId);

  const dayIds = (days || []).map((d) => d.id);

  // Get total task count for the StayKit
  const { count: totalTasks } = await supabase
    .from('staykit_tasks')
    .select('id', { count: 'exact', head: true })
    .in('day_id', dayIds);

  // Get completed task count
  const { data: completedTasks } = await supabase
    .from('user_task_completion')
    .select(`
      id,
      task:staykit_tasks!inner (
        id,
        day:staykit_days!inner (
          staykit_id
        )
      )
    `)
    .eq('user_id', userId);

  const completedInStaykit = (completedTasks || []).filter((c: any) => {
    const day = Array.isArray(c.task.day) ? c.task.day[0] : c.task.day;
    return day.staykit_id === staykitId;
  });

  const tasksCompleted = completedInStaykit.length;
  const total = totalTasks || 0;
  const percentage = total > 0 ? Math.round((tasksCompleted / total) * 100) : 0;

  // Update or create progress record
  await supabase.from('user_staykit_progress').upsert(
    {
      user_id: userId,
      staykit_id: staykitId,
      tasks_completed: tasksCompleted,
      total_tasks: total,
      progress_percentage: percentage,
      updated_at: new Date().toISOString(),
      completed_at: percentage === 100 ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,staykit_id' }
  );
}
