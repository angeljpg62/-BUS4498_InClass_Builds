-- Stage 7: flyer photos.

-- The public link to the post's flyer photo, or empty when there is none.
alter table public.events
  add column flyer_url text not null default '';

-- The website may read the link (it shows the photo on published event cards).
grant select (flyer_url) on public.events to anon, authenticated;

-- A public storage bucket for flyers: 5 MB limit, JPG and PNG only.
-- The website gets no storage policies, so only the agent (secret key) can upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flyers', 'flyers', true, 5242880, array['image/jpeg', 'image/png']);
