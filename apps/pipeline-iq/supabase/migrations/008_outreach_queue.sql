-- Create the outreach queue to manage drip campaigns
create table if not exists outreach_queue (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references high_priority_projects(id) on delete cascade not null,
    recipient_email text not null,
    recipient_name text,
    email_subject text not null,
    email_body text not null,
    -- Storing fully generated HTML/Text
    -- Prioritization
    priority_score int default 0,
    -- Maps to Groove Fit Score
    vertical text,
    -- State
    status text default 'pending' check (
        status in ('pending', 'sent', 'failed', 'skipped')
    ),
    error_message text,
    -- Timing
    created_at timestamptz default now(),
    scheduled_for timestamptz,
    sent_at timestamptz,
    -- Metadata
    metadata jsonb default '{}'::jsonb
);
-- Index for the Scheduler to quickly find pending items
create index idx_outreach_queue_pending on outreach_queue(status, priority_score desc)
where status = 'pending';