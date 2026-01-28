/**
 * StayKit Library
 * Database query functions for StayKit products and user progress
 */

import { supabase } from './supabaseClient';
import type {
  StayKit,
  StayKitDay,
  StayKitTask,
  StayKitTip,
  UserStayKitProgress,
  UserTaskCompletion,
  StayKitDayWithTasks,
  StayKitTaskWithTips,
  StayKitWithProgress,
} from '@/types/database.types';

// ============================================================================
// USER ACCESS & PROGRESS
// ============================================================================

/**
 * Get all StayKits owned/accessed by a user
 */
export async function getUserStayKits(
  userId: string
): Promise<StayKitWithProgress[]> {
  const { data, error } = await supabase
    .from('customer_product_access')
    .select(
      `
      access_granted_at,
      staykit:staykits!inner (
        id,
        name,
        slug,
        code,
        product_key,
        tagline,
        description,
        day_count,
        milestone_day_count,
        task_count,
        tip_count,
        destination_count,
        price,
        regular_price,
        cover_image_url,
        status,
        featured,
        created_at,
        updated_at,
        published_at
      )
    `
    )
    .eq('user_id', userId)
    .eq('product_type', 'staykit')
    .order('access_granted_at', { ascending: false });

  if (error) {
    console.error('Error fetching user StayKits:', error);
    return [];
  }

  // Get progress for each StayKit
  const staykitIds = (data || [])
    .map((item: any) =>
      Array.isArray(item.staykit) ? item.staykit[0]?.id : item.staykit?.id
    )
    .filter(Boolean);

  const { data: progressData } = await supabase
    .from('user_staykit_progress')
    .select('*')
    .eq('user_id', userId)
    .in('staykit_id', staykitIds);

  const progressMap = new Map(
    (progressData || []).map((p) => [p.staykit_id, p])
  );

  // Combine StayKit data with progress
  return (data || []).map((item: any) => {
    const staykit = Array.isArray(item.staykit)
      ? item.staykit[0]
      : item.staykit;
    return {
      ...staykit,
      progress: progressMap.get(staykit.id) || null,
    };
  });
}

/**
 * Check if a user has access to a specific StayKit
 */
export async function checkStayKitAccess(
  userId: string,
  staykitId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('customer_product_access')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', staykitId)
    .eq('product_type', 'staykit')
    .maybeSingle();

  if (error) {
    console.error('Error checking StayKit access:', error);
    return false;
  }

  return data !== null;
}

/**
 * Get user's progress for a specific StayKit
 */
export async function getUserProgress(
  userId: string,
  staykitId: string
): Promise<UserStayKitProgress | null> {
  const { data, error } = await supabase
    .from('user_staykit_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('staykit_id', staykitId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }

  return data;
}

/**
 * Initialize or update user progress
 */
export async function upsertUserProgress(
  userId: string,
  staykitId: string,
  updates: Partial<UserStayKitProgress>
): Promise<UserStayKitProgress | null> {
  const { data, error } = await supabase
    .from('user_staykit_progress')
    .upsert(
      {
        user_id: userId,
        staykit_id: staykitId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,staykit_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting progress:', error);
    return null;
  }

  return data;
}

// ============================================================================
// STAYKIT CONTENT
// ============================================================================

/**
 * Get StayKit by slug
 */
export async function getStayKitBySlug(
  slug: string
): Promise<StayKit | null> {
  const { data, error } = await supabase
    .from('staykits')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching StayKit:', error);
    return null;
  }

  return data;
}

/**
 * Get all active StayKits (for marketplace/catalog)
 */
export async function getAllStayKits(): Promise<StayKit[]> {
  const { data, error } = await supabase
    .from('staykits')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching StayKits:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all milestone days for a StayKit
 */
export async function getStayKitDays(
  staykitId: string
): Promise<StayKitDay[]> {
  const { data, error } = await supabase
    .from('staykit_days')
    .select('*')
    .eq('staykit_id', staykitId)
    .order('day_number', { ascending: true });

  if (error) {
    console.error('Error fetching StayKit days:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a specific day with all tasks and tips
 */
export async function getStayKitDayWithTasks(
  dayId: string
): Promise<StayKitDayWithTasks | null> {
  // Get the day
  const { data: day, error: dayError } = await supabase
    .from('staykit_days')
    .select('*')
    .eq('id', dayId)
    .single();

  if (dayError || !day) {
    console.error('Error fetching day:', dayError);
    return null;
  }

  // Get tasks for the day
  const { data: tasks, error: tasksError } = await supabase
    .from('staykit_tasks')
    .select(
      `
      *,
      destination:destinations (
        id,
        name,
        slug,
        image_url,
        latitude,
        longitude,
        address_full
      )
    `
    )
    .eq('day_id', dayId)
    .order('task_order', { ascending: true });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
    return { ...day, tasks: [] };
  }

  // Get tips for all tasks
  const taskIds = (tasks || []).map((t) => t.id);
  const { data: tips, error: tipsError } = await supabase
    .from('staykit_tips')
    .select('*')
    .in('task_id', taskIds)
    .order('tip_order', { ascending: true });

  if (tipsError) {
    console.error('Error fetching tips:', tipsError);
  }

  // Organize tips by task
  const tipsMap = new Map<string, StayKitTip[]>();
  (tips || []).forEach((tip) => {
    if (!tipsMap.has(tip.task_id)) {
      tipsMap.set(tip.task_id, []);
    }
    tipsMap.get(tip.task_id)!.push(tip);
  });

  // Combine tasks with tips and destination data
  const tasksWithTips: StayKitTaskWithTips[] = (tasks || []).map((task) => ({
    ...task,
    tips: tipsMap.get(task.id) || [],
    destination: Array.isArray(task.destination)
      ? task.destination[0]
      : task.destination,
  }));

  return {
    ...day,
    tasks: tasksWithTips,
  };
}

/**
 * Get all days with tasks for a StayKit (full content tree)
 */
export async function getStayKitFullContent(
  staykitId: string
): Promise<StayKitDayWithTasks[]> {
  // Get all days
  const days = await getStayKitDays(staykitId);

  if (!days.length) return [];

  // Get all tasks for all days
  const dayIds = days.map((d) => d.id);
  const { data: tasks, error: tasksError } = await supabase
    .from('staykit_tasks')
    .select(
      `
      *,
      destination:destinations (
        id,
        name,
        slug,
        image_url,
        latitude,
        longitude,
        address_full
      )
    `
    )
    .in('day_id', dayIds)
    .order('task_order', { ascending: true });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
    return days.map((day) => ({ ...day, tasks: [] }));
  }

  // Get all tips for all tasks
  const taskIds = (tasks || []).map((t) => t.id);
  const { data: tips, error: tipsError } = await supabase
    .from('staykit_tips')
    .select('*')
    .in('task_id', taskIds)
    .order('tip_order', { ascending: true });

  if (tipsError) {
    console.error('Error fetching tips:', tipsError);
  }

  // Organize tips by task
  const tipsMap = new Map<string, StayKitTip[]>();
  (tips || []).forEach((tip) => {
    if (!tipsMap.has(tip.task_id)) {
      tipsMap.set(tip.task_id, []);
    }
    tipsMap.get(tip.task_id)!.push(tip);
  });

  // Organize tasks by day
  const tasksMap = new Map<string, StayKitTaskWithTips[]>();
  (tasks || []).forEach((task) => {
    if (!tasksMap.has(task.day_id)) {
      tasksMap.set(task.day_id, []);
    }
    tasksMap.get(task.day_id)!.push({
      ...task,
      tips: tipsMap.get(task.id) || [],
      destination: Array.isArray(task.destination)
        ? task.destination[0]
        : task.destination,
    });
  });

  // Combine everything
  return days.map((day) => ({
    ...day,
    tasks: tasksMap.get(day.id) || [],
  }));
}

// ============================================================================
// TASK COMPLETION
// ============================================================================

/**
 * Get all completed tasks for a user in a specific StayKit
 */
export async function getUserCompletedTasks(
  userId: string,
  staykitId: string
): Promise<UserTaskCompletion[]> {
  const { data, error } = await supabase
    .from('user_task_completion')
    .select(
      `
      *,
      task:staykit_tasks!inner (
        id,
        day_id,
        day:staykit_days!inner (
          id,
          staykit_id
        )
      )
    `
    )
    .eq('user_id', userId)
    .eq('task.day.staykit_id', staykitId);

  if (error) {
    console.error('Error fetching completed tasks:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark a task as complete
 */
export async function completeTask(
  userId: string,
  taskId: string,
  notes?: string,
  photoUrl?: string
): Promise<UserTaskCompletion | null> {
  const { data, error } = await supabase
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

  if (error) {
    console.error('Error completing task:', error);
    return null;
  }

  return data;
}

/**
 * Uncomplete a task (remove completion record)
 */
export async function uncompleteTask(
  userId: string,
  taskId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_task_completion')
    .delete()
    .eq('user_id', userId)
    .eq('task_id', taskId);

  if (error) {
    console.error('Error uncompleting task:', error);
    return false;
  }

  return true;
}

/**
 * Check if a specific task is completed by the user
 */
export async function isTaskCompleted(
  userId: string,
  taskId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_task_completion')
    .select('id')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .maybeSingle();

  if (error) {
    console.error('Error checking task completion:', error);
    return false;
  }

  return data !== null;
}

// ============================================================================
// ACCESS MANAGEMENT
// ============================================================================

/**
 * Grant a user access to a StayKit (after purchase, redemption, etc.)
 */
export async function grantStayKitAccess(
  userId: string,
  staykitId: string,
  accessType: 'purchased' | 'redeemed' | 'complimentary' = 'purchased'
): Promise<boolean> {
  const { error } = await supabase.from('customer_product_access').insert({
    user_id: userId,
    product_id: staykitId,
    product_type: 'staykit',
    access_type: accessType,
    access_granted_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error granting StayKit access:', error);
    return false;
  }

  // Initialize user progress
  const staykit = await getStayKitBySlug('').catch(() => null);
  // Fetch the actual staykit to get day count
  const { data: sk } = await supabase
    .from('staykits')
    .select('*')
    .eq('id', staykitId)
    .single();

  if (sk) {
    await upsertUserProgress(userId, staykitId, {
      access_granted_at: new Date().toISOString(),
      progress_percentage: 0,
      tasks_completed: 0,
      total_tasks: sk.task_count || 0,
    });
  }

  return true;
}

// ============================================================================
// ANALYTICS & STATS
// ============================================================================

/**
 * Calculate progress percentage for a user's StayKit
 */
export async function calculateProgress(
  userId: string,
  staykitId: string
): Promise<{
  tasksCompleted: number;
  totalTasks: number;
  percentage: number;
  currentDay: number | null;
}> {
  // Get total tasks
  const { count: totalTasks } = await supabase
    .from('staykit_tasks')
    .select('id', { count: 'exact', head: true })
    .eq(
      'day_id',
      supabase
        .from('staykit_days')
        .select('id')
        .eq('staykit_id', staykitId)
    );

  // Get completed tasks
  const completedTasks = await getUserCompletedTasks(userId, staykitId);

  const tasksCompleted = completedTasks.length;
  const total = totalTasks || 0;
  const percentage = total > 0 ? Math.round((tasksCompleted / total) * 100) : 0;

  // Get current day (last incomplete day)
  const days = await getStayKitDays(staykitId);
  let currentDay: number | null = null;

  for (const day of days) {
    const { data: dayTasks } = await supabase
      .from('staykit_tasks')
      .select('id')
      .eq('day_id', day.id);

    const dayTaskIds = (dayTasks || []).map((t) => t.id);
    const completedInDay = completedTasks.filter((c) =>
      dayTaskIds.includes(c.task_id)
    );

    if (completedInDay.length < dayTaskIds.length) {
      currentDay = day.day_number;
      break;
    }
  }

  return {
    tasksCompleted,
    totalTasks: total,
    percentage,
    currentDay,
  };
}
