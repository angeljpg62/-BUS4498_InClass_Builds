-- Stage 12: the club's earlier posts (memory of what happened).
-- When a club posts an update ("moved to 7 pm"), the agent finds the earlier post,
-- and the earlier post is retired as 'replaced' so the website shows one card per event.

-- A fifth status: replaced by a newer post.
alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status in ('published', 'waiting', 'rejected', 'archived', 'replaced'));

-- replaced_by: the newer post that took this one's place.
-- updates_id: on a waiting update, the earlier post it will replace once a moderator approves it.
alter table public.events
  add column if not exists replaced_by uuid,
  add column if not exists updates_id uuid;

-- Moderators may now also set a post to 'replaced' (when they approve an update).
drop policy if exists "Moderators can review events" on public.events;
create policy "Moderators can review events"
  on public.events for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected', 'replaced'));
