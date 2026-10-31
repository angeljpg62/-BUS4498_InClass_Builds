-- Stage 11: the club list (knowledge).
-- The agent reads this table on every post. Moderators keep it current in the Table Editor,
-- so a change shows up on the very next post with nothing redeployed. See context/clubs.md.

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique check (char_length(name) between 1 and 200),
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);

-- Some projects hand every new table to visitors by default, so start from nothing.
alter table public.clubs enable row level security;
revoke all on public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant select, insert, update, delete on public.clubs to service_role;

drop policy if exists "Anyone can read active clubs" on public.clubs;
create policy "Anyone can read active clubs"
  on public.clubs for select
  to anon, authenticated
  using (active);

-- The six starting clubs (all made up). Running this again changes nothing.
insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail) values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220'),
  ('Mustang Pitch Society', 'pitch society, pitch club', 'UU-PLAZA', ''),
  ('Women in Finance Circle', 'Women in Finance, WIF', 'BUSINESS', 'Room 112'),
  ('Sustainability Crew', 'sustainability club, green crew', 'DEXTER-LAWN', ''),
  ('Accounting Society', 'accounting club', 'BUSINESS', 'Room 212'),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snowboard club, ski and snowboard club', 'UU', 'Room 216')
on conflict (name) do nothing;

-- What the agent looked at for each post (club list match, and later the earlier posts and lessons).
alter table public.events
  add column if not exists agent_notes text[] not null default '{}';

-- The moderator's "Clear the board" tool deletes every post.
drop policy if exists "Moderators can delete events" on public.events;
create policy "Moderators can delete events"
  on public.events for delete
  to authenticated
  using (true);
grant delete on public.events to authenticated;
