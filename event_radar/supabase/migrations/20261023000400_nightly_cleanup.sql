-- Optional stage: the nightly clean-up.
-- Every night, posts for events that have already happened are archived,
-- so they leave the website and no longer block a new post at the same date, time, and place.

create extension if not exists pg_cron;

-- 10:00 UTC is about 3 a.m. Pacific (2 a.m. during winter time).
-- Scheduling a job with the same name again replaces it instead of adding a second one.
select cron.schedule(
  'archive-past-events',
  '0 10 * * *',
  $$
    update public.events
    set status = 'archived'
    where status in ('published', 'waiting')
      and event_date < (now() at time zone 'America/Los_Angeles')::date;
  $$
);
