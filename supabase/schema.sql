-- AB VISUALS · Supabase schema (run once in SQL Editor)
create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id text primary key,
  title text not null,
  slug text,
  category text,
  location text,
  year text,
  ticket_rows jsonb default '[]'::jsonb,
  short_key text,
  short_desc text,
  full_description text,
  youtube_urls jsonb default '[]'::jsonb,
  preview_video_url text,
  cover_image_url text,
  gallery_images jsonb default '[]'::jsonb,
  sort_order int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  shoot_type text,
  shoot_date text,
  location text,
  message text,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.site_content enable row level security;
alter table public.inquiries enable row level security;

-- Public site reads
create policy "projects read" on public.projects for select using (true);
create policy "site read" on public.site_content for select using (true);

-- Admin writes (client-side CMS; keep the passcode private)
create policy "projects write" on public.projects for all using (true) with check (true);
create policy "site write" on public.site_content for all using (true) with check (true);
create policy "inquiries insert" on public.inquiries for insert with check (true);
create policy "inquiries read" on public.inquiries for select using (true);

-- Public media bucket
insert into storage.buckets (id, name, public)
values ('ab-visuals-media', 'ab-visuals-media', true)
on conflict (id) do update set public = true;

create policy "media read" on storage.objects for select
  using (bucket_id = 'ab-visuals-media');
create policy "media write" on storage.objects for insert
  with check (bucket_id = 'ab-visuals-media');
create policy "media update" on storage.objects for update
  using (bucket_id = 'ab-visuals-media');
create policy "media delete" on storage.objects for delete
  using (bucket_id = 'ab-visuals-media');
