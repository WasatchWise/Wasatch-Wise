import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function verifySendGridSignature(payload: string, signature: string, timestamp: string) {
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY
    if (!publicKey) {
        console.log('⚠️ SENDGRID_WEBHOOK_PUBLIC_KEY not set - skipping signature verification')
        return true
    }

    try {
        const key = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`
        const verifier = crypto.createVerify('sha256')
        verifier.update(timestamp + payload)
        verifier.end()
        const isValid = verifier.verify(key, Buffer.from(signature, 'base64'))
        if (!isValid) {
            console.error('❌ SendGrid signature verification failed - signature mismatch')
        }
        return isValid
    } catch (error) {
        console.error('❌ SendGrid signature verification error:', error)
        return false
    }
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    console.log('🔔 SendGrid webhook endpoint hit')
    
    try {
        const signature = req.headers.get('x-twilio-email-event-webhook-signature') || ''
        const timestamp = req.headers.get('x-twilio-email-event-webhook-timestamp') || ''
        const payload = await req.text()

        console.log(`📋 Webhook payload length: ${payload.length} bytes`)

        // Signature verification (skip if no public key configured)
        if (process.env.SENDGRID_WEBHOOK_PUBLIC_KEY) {
            if (!signature || !timestamp) {
                console.error('❌ Missing signature or timestamp headers')
                return NextResponse.json({ error: 'Missing auth headers' }, { status: 401 })
            }
            if (!verifySendGridSignature(payload, signature, timestamp)) {
                console.error('❌ Signature verification failed')
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            console.log('✅ Signature verified')
        }

        const events = JSON.parse(payload)

        if (!Array.isArray(events)) {
            console.error('❌ Payload is not an array')
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        console.log(`📨 SendGrid webhook: received ${events.length} events`)
        
        // Log event types for debugging
        const eventTypes = events.map(e => e.event).reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1
            return acc
        }, {} as Record<string, number>)
        console.log(`📊 Event types: ${JSON.stringify(eventTypes)}`)

        let processedCount = 0
        let skippedCount = 0
        let errorCount = 0

        for (const event of events) {
            // We only care about open/click for now
            const isOpen = event.event === 'open'
            const isClick = event.event === 'click'

            if (!isOpen && !isClick) {
                skippedCount++
                continue // Skip other event types
            }

            // SendGrid sends custom_args as 'unique_args' in webhook events
            const activityId = event.unique_args?.activity_id || event.custom_args?.activity_id
            const queueId = event.unique_args?.queue_id || event.custom_args?.queue_id
            const projectId = event.unique_args?.project_id || event.custom_args?.project_id

            console.log(`🔍 Processing ${event.event}: activityId=${activityId || 'n/a'}, queueId=${queueId || 'n/a'}, projectId=${projectId || 'n/a'}`)

            if (!activityId && !queueId) {
                console.log(`⚠️ SendGrid ${event.event} missing activity_id/queue_id - cannot match to activity`)
                skippedCount++
                continue
            }

            if (isOpen) {
                console.log(`👁️ Email Opened! ActivityID: ${activityId || 'n/a'} QueueID: ${queueId || 'n/a'}`)

                // Find the outreach activity - try multiple lookup strategies
                let activity: any = null
                let fetchError: any = null

                // Strategy 1: Lookup by activity_id (direct ID match)
                if (activityId) {
                    console.log(`   Trying lookup by activity_id: ${activityId}`)
                    const result = await supabase
                        .from('outreach_activities')
                        .select('id, project_id, contact_id, metadata, project:projects(*), contact:contacts(*)')
                        .eq('id', activityId)
                        .single()
                    activity = result.data
                    fetchError = result.error
                }

                // Strategy 2: Lookup by queue_id in metadata (JSONB contains)
                if (!activity && queueId) {
                    console.log(`   Trying lookup by queue_id in metadata: ${queueId}`)
                    // Use contains operator for JSONB - more reliable than ->> text extraction
                    const result = await supabase
                        .from('outreach_activities')
                        .select('id, project_id, contact_id, metadata, project:projects(*), contact:contacts(*)')
                        .contains('metadata', { queue_id: queueId })
                        .single()
                    activity = result.data
                    fetchError = result.error
                    
                    // Fallback: Try text extraction if contains fails
                    if (!activity && fetchError) {
                        console.log(`   Contains failed, trying text extraction...`)
                        const textResult = await supabase
                            .from('outreach_activities')
                            .select('id, project_id, contact_id, metadata, project:projects(*), contact:contacts(*)')
                            .eq('metadata->>queue_id', queueId)
                            .single()
                        activity = textResult.data
                        fetchError = textResult.error
                    }
                }

                // Strategy 3: If we have project_id but no activity match, try finding by project + recent sent
                if (!activity && projectId) {
                    console.log(`   Trying lookup by project_id: ${projectId}`)
                    const result = await supabase
                        .from('outreach_activities')
                        .select('id, project_id, contact_id, metadata, project:projects(*), contact:contacts(*)')
                        .eq('project_id', projectId)
                        .eq('status', 'sent')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()
                    activity = result.data
                    fetchError = result.error
                }

                if (fetchError || !activity) {
                    console.error(`❌ Failed to find activity for sendgrid event:`, fetchError?.message || 'No match found')
                    console.log(`   Lookup params: activityId=${activityId}, queueId=${queueId}, projectId=${projectId}`)
                    errorCount++
                    continue
                }
                
                console.log(`✅ Found activity: ${activity.id}`)

                console.log('🔎 Warm call activity linkage', {
                    activity_id: activity.id,
                    project_id: activity.project_id,
                    contact_id: activity.contact_id,
                })

                // Update Outreach Activity (opened)
                // Back-compat: outreach_activities.updated_at may not exist in some schemas.
                const openedUpdate = {
                    status: 'opened',
                    opened_at: new Date().toISOString(),
                }

                const { error } = await supabase
                    .from('outreach_activities')
                    .update(openedUpdate)
                    .eq('id', activity.id)

                if (error) {
                    console.error(`❌ Failed to update opened status for queue_id ${queueId}:`, error)
                    errorCount++
                } else {
                    console.log(`✅ Updated opened status for activity ${activity.id}`)
                    processedCount++
                    
                    // Trigger warm call notification if we have contact data
                    if (activity.contact_id) {
                        try {
                            const { sendWarmCallNotification, generateCallScript } = await import('@/lib/workflows/warm-call/notification-service')
                            
                            const project = activity.project as any
                            const contact = activity.contact as any
                            if (!contact) {
                                console.log('⚠️ Warm call notification skipped - missing contact', {
                                    activity_id: activity.id,
                                    project_id: activity.project_id,
                                })
                                continue
                            }
                            const prospectName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email
                            const projectName = project?.project_name || 'the project'
                            
                            // Get classification context (supports multiple metadata shapes)
                            const classification =
                                activity.metadata?.verticalClassification ||
                                activity.metadata?.classification ||
                                null

                            const grooveVertical =
                                activity.metadata?.grooveVertical ||
                                classification?.grooveVertical ||
                                'multifamily'

                            const grooveBundle =
                                activity.metadata?.grooveBundle ||
                                classification?.grooveBundle ||
                                'MDU Bundle'

                            const painPoint =
                                activity.metadata?.painPoint ||
                                activity.metadata?.pain_point ||
                                (Array.isArray(activity.metadata?.painPoints) ? activity.metadata.painPoints[0] : null) ||
                                (Array.isArray(classification?.painPoints) ? classification.painPoints[0] : null) ||
                                'Technology infrastructure coordination'
                            
                            const callScript = generateCallScript(prospectName, projectName, painPoint)
                            
                            const engagementTime = typeof event.timestamp === 'number'
                                ? new Date(event.timestamp * 1000)
                                : new Date()

                            await sendWarmCallNotification({
                                prospectName,
                                building: projectName,
                                painPoint: `${grooveBundle}: ${painPoint}`, // Include bundle context
                                callScript,
                                engagementType: 'open',
                                engagementTime,
                                projectId: activity.project_id || null,
                                contactId: activity.contact_id,
                                emailActivityId: activity.id,
                            })

                            console.log('✅ Warm call notification dispatch complete', {
                                activity_id: activity.id,
                                prospect: prospectName,
                                engagementType: 'open',
                            })
                            
                            // Log the vertical context for Mike
                            console.log(`📊 Vertical: ${grooveVertical}, Bundle: ${grooveBundle}, Pain: ${painPoint}`)
                            
                            console.log(`🔥 Warm call notification triggered for ${prospectName}`)
                        } catch (notifError) {
                            console.error('Failed to send warm call notification:', notifError)
                            // Don't fail the webhook - notification is secondary
                        }
                    } else {
                        console.log('⚠️ Warm call notification skipped - missing contact_id', {
                            activity_id: activity.id,
                            project_id: activity.project_id,
                            contact_id: activity.contact_id,
                        })
                    }
                }
            }

            if (isClick) {
                console.log(`👆 Email Clicked! ActivityID: ${activityId || 'n/a'} QueueID: ${queueId || 'n/a'}`)
                
                // First check if opened_at is already set
                const { data: existing } = activityId
                    ? await supabase
                        .from('outreach_activities')
                        .select('id, opened_at')
                        .eq('id', activityId)
                        .single()
                    : await supabase
                        .from('outreach_activities')
                        .select('id, opened_at')
                        .eq('metadata->>queue_id', queueId)
                        .single()

                // Update for click (set opened_at if not already set).
                // Note: clicked_at may not exist in all schemas; we retry without it if needed.
                const updateDataWithClick: any = {
                    status: 'clicked',
                    clicked_at: new Date().toISOString(),
                }

                // If opened_at is not set, set it now (click implies open)
                if (!existing?.opened_at) {
                    updateDataWithClick.opened_at = new Date().toISOString()
                }

                let { error } = await supabase
                    .from('outreach_activities')
                    .update(updateDataWithClick)
                    .eq('id', (existing as any)?.id || activityId)

                if (error && typeof (error as any).message === 'string' && (error as any).message.includes('clicked_at') && (error as any).message.includes('does not exist')) {
                    const updateDataNoClick: any = {
                        status: 'clicked',
                    }
                    if (!existing?.opened_at) {
                        updateDataNoClick.opened_at = new Date().toISOString()
                    }
                    ;({ error } = await supabase
                        .from('outreach_activities')
                        .update(updateDataNoClick)
                        .eq('id', (existing as any)?.id || activityId))
                }

                if (error) {
                    console.error(`❌ Failed to update clicked status for queue_id ${queueId}:`, error)
                    errorCount++
                } else {
                    console.log(`✅ Updated clicked status for activity`)
                    processedCount++

                    // Trigger warm call notification on click as well (higher intent)
                    try {
                        // Re-fetch activity w/ joined data for click flow
                        const { data: clickedActivity } = activityId
                            ? await supabase
                                .from('outreach_activities')
                                .select('id, project_id, contact_id, metadata, project:projects(*), contact:contacts(*)')
                                .eq('id', activityId)
                                .single()
                            : await supabase
                                .from('outreach_activities')
                                .select('id, project_id, contact_id, metadata, project:projects(*), contact:contacts(*)')
                                .eq('metadata->>queue_id', queueId)
                                .single()

                        if (clickedActivity?.contact_id) {
                            const { sendWarmCallNotification, generateCallScript } = await import('@/lib/workflows/warm-call/notification-service')

                            const project = clickedActivity.project as any
                            const contact = clickedActivity.contact as any
                            if (!contact) {
                                console.log('⚠️ Warm call notification skipped - missing contact (click)', {
                                    activity_id: clickedActivity.id,
                                    project_id: clickedActivity.project_id,
                                })
                                continue
                            }
                            const prospectName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email
                            const projectName = project?.project_name || 'the project'

                            const classification =
                                clickedActivity.metadata?.verticalClassification ||
                                clickedActivity.metadata?.classification ||
                                null

                            const grooveBundle =
                                clickedActivity.metadata?.grooveBundle ||
                                classification?.grooveBundle ||
                                'MDU Bundle'

                            const painPoint =
                                clickedActivity.metadata?.painPoint ||
                                clickedActivity.metadata?.pain_point ||
                                (Array.isArray(clickedActivity.metadata?.painPoints) ? clickedActivity.metadata.painPoints[0] : null) ||
                                (Array.isArray(classification?.painPoints) ? classification.painPoints[0] : null) ||
                                'Technology infrastructure coordination'

                            const callScript = generateCallScript(prospectName, projectName, painPoint)

                            const engagementTime = typeof event.timestamp === 'number'
                                ? new Date(event.timestamp * 1000)
                                : new Date()

                            await sendWarmCallNotification({
                                prospectName,
                                building: projectName,
                                painPoint: `${grooveBundle}: ${painPoint}`,
                                callScript,
                                engagementType: 'click',
                                engagementTime,
                                projectId: clickedActivity.project_id || null,
                                contactId: clickedActivity.contact_id,
                                emailActivityId: clickedActivity.id,
                            })
                            console.log(`🔥 Warm call notification (click) triggered for ${prospectName}`)
                        }
                    } catch (notifError) {
                        console.error('Failed to send warm call notification (click):', notifError)
                    }
                }
            }
        }

        // Summary log
        console.log(`📊 Webhook processing complete: ${processedCount} processed, ${skippedCount} skipped, ${errorCount} errors`)

        return NextResponse.json({ 
            success: true,
            processed: processedCount,
            skipped: skippedCount,
            errors: errorCount
        })

    } catch (error: any) {
        console.error('❌ Webhook Error:', error)
        return NextResponse.json({ error: 'Internal Error', message: error.message }, { status: 500 })
    }
}
