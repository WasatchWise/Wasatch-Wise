import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateRequestId, createErrorResponse, NotFoundError, ValidationError } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

// ============================================
// GET /api/projects/[id] - Get single project
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new NotFoundError('Project')
    }

    return NextResponse.json({ project: data, requestId })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}

// ============================================
// PATCH /api/projects/[id] - Update project
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    // Only allow specific fields to be updated
    const allowedFields = ['outreach_status', 'priority_level', 'notes', 'assigned_to', 'next_contact_date']
    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No valid fields to update')
    }

    logger.info('Updating project', { requestId, projectId: id, updates })

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update project', { requestId, error: error.message })
      throw error
    }

    if (!data) {
      throw new NotFoundError('Project')
    }

    return NextResponse.json({ project: data, requestId })
  } catch (error) {
    return createErrorResponse(error, requestId)
  }
}
