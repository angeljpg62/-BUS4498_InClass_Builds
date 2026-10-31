-- Stage 8: moderator sign-in.
-- Signed-in moderators can see every post (including waiting ones) and approve or reject them.
-- This is safe only because new sign-ups are turned off: the only signed-in users are the
-- moderator accounts created in Authentication → Users.

-- Moderators may read every post, not just published ones.
drop policy if exists "Moderators can read every event" on public.events;
create policy "Moderators can read every event"
  on public.events for select
  to authenticated
  using (true);

-- Moderators may change a post, but only to published, waiting, or rejected.
drop policy if exists "Moderators can review events" on public.events;
create policy "Moderators can review events"
  on public.events for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected'));

-- Moderators see the whole post (the original text, the reasons, the notes)...
grant select on public.events to authenticated;
-- ...but can change only the decision columns.
grant update (status, status_reason, reviewed_at, reviewed_by) on public.events to authenticated;
