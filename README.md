# AB VISUALS — "Laptop Dive" Portfolio + Admin CMS

Interactive one-screen portfolio for **AB VISUALS** (drone pilot · wedding cinematography studio) with a secret full admin CMS at `/amit231106`.

## Stack

- **React 18 + Vite 6 + TypeScript + Tailwind CSS v4**
- SPA routing with History API + fallback rewrites (`vercel.json`, `public/_redirects`) so `/amit231106` never 404s
- **Backend:** Supabase (Postgres + Storage) when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set — or paste keys inside the admin panel. Otherwise a zero-config **local adapter** (IndexedDB for media + localStorage for content) keeps everything working, pre-seeded with the 6 starter projects.

## Routes

| Path | What |
|---|---|
| `/` | "Laptop Dive" hero → scroll/swipe into the laptop, case showcase, full-screen project cinema (inline YouTube + photo lightbox), services/contact drawer, bottom social bar |
| `/amit231106` | Password-protected studio admin (default passcode `amit231106`, changeable in Settings) |

## Admin tabs

1. **Projects** — CRUD, publish/draft, reorder, unlimited direct photo upload (auto WebP compress ≤2048px, per-file progress), cover/reorder/captions, YouTube link manager with live embed preview, MP4 preview URL.
2. **Contact & Socials** — phone, WhatsApp number + greeting, email, city, and the bottom Instagram / YouTube / WhatsApp bar (links, labels, show/hide). Edits go live everywhere instantly.
3. **Text & Services** — hero wordmark, handwritten script, scroll hint, lanyard ID badge (texts + custom portrait upload), all nav/ticket labels, services manager.
4. **Settings & Backup** — one-click Supabase connect, copy-paste setup SQL, change passcode, export/import JSON backup, reset-to-defaults, shoot-inquiry inbox.

## Supabase setup (60 seconds)

1. Create a project, open the **SQL editor**, run the snippet from **Settings → One-time setup SQL** (also printed below).
2. Create a **publishable key** (Project Settings → API Keys) and copy the project URL + key into **Settings → Connect Supabase Cloud** (or set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars at deploy time).

```sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text default '', slug text default '', category text default '',
  location text default '', year text default '',
  ticket_rows jsonb default '[]'::jsonb, short_key text default '',
  short_desc text default '', full_description text default '',
  youtube_urls jsonb default '[]'::jsonb, preview_video_url text,
  cover_image_url text default '', gallery_images jsonb default '[]'::jsonb,
  sort_order int default 0, is_published boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.site_content (id text primary key, data jsonb not null);
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), name text default '', type text default '',
  date text default '', location text default '', message text default '', created_at timestamptz default now()
);
alter table public.projects enable row level security;
alter table public.site_content enable row level security;
alter table public.inquiries enable row level security;
drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects for select using (true);
drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content" on public.site_content for select using (true);
drop policy if exists "public write projects" on public.projects;
create policy "public write projects" on public.projects for all using (true) with check (true);
drop policy if exists "public write site_content" on public.site_content;
create policy "public write site_content" on public.site_content for all using (true) with check (true);
drop policy if exists "public write inquiries" on public.inquiries;
create policy "public write inquiries" on public.inquiries for insert with check (true);
insert into storage.buckets (id, name, public) values ('ab-visuals-media','ab-visuals-media',true) on conflict (id) do nothing;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'ab-visuals-media');
drop policy if exists "media public write" on storage.objects;
create policy "media public write" on storage.objects for all using (bucket_id = 'ab-visuals-media') with check (bucket_id = 'ab-visuals-media');
```

> The app-level passcode gates the CMS; the anon/publishable key only reaches public-read data plus the CMS writes. For stricter production hardening, move writes behind Supabase Auth or the service key.

## Develop / build

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle to dist/
npm run preview  # serve dist on :4173
```

## Notes

- All uploads are compressed client-side (canvas → WebP, max 2048px, q0.85) before storage.
- Local mode: media lives in IndexedDB, content in localStorage — works fully offline in preview; connect Supabase to sync across all devices.
- The studio plate / cutout / badge / transition video URLs are centralized in `src/lib/assets.ts`.
