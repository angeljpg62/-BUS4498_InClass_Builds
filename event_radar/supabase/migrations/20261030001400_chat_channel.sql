-- Stage 14: read posts from a chat group (GroupMe).
-- Each post remembers which chat message it came from, so the same message never gets two decisions.
-- The reader keeps a bookmark (channel_cursor) so it never reads a message twice,
-- and a scheduled job runs the reader every minute.

-- Where a post came from: 'groupme' and the message id, or empty for posts typed on the website.
alter table public.events
  add column if not exists source text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists source_name text not null default '';

-- One decision per chat message, enforced by the database.
create unique index if not exists events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

-- The reader's bookmark: the last message it handled, per chat app.
create table if not exists public.channel_cursor (
  source text primary key,
  last_id text not null default '',
  read_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from anon, authenticated;
grant select, insert, update, delete on public.channel_cursor to service_role;

-- Run the GroupMe reader every minute.
-- The publishable key is public (the website uses it too); it only lets the job reach the function.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Scheduling a job with the same name again replaces it instead of adding a second one.
select cron.schedule(
  'read-chat-channel',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://knvnqcfyskvzcetneqrc.supabase.co/functions/v1/read-channel',
      headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_gUHjxsdBjrLxTiZTsgi2fg_WGnj0e8r"}'::jsonb,
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
  $$
);
