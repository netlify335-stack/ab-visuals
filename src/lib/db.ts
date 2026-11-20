import { Project, SiteContent, Inquiry } from './types'
import { localAdapter } from './dbLocal'
import { createSupabaseAdapter, SupabaseAdapter, SupabaseCreds } from './dbSupabase'

export interface Adapter {
  mode: 'local' | 'supabase'
  getProjects(): Promise<Project[]>
  saveProject(p: Project): Promise<void>
  deleteProject(id: string): Promise<void>
  getContent(): Promise<SiteContent | null>
  saveContent(c: SiteContent): Promise<void>
  upload(blob: Blob, name: string, onProgress?: (p: number) => void): Promise<string>
  deleteImage(url: string): Promise<void>
  subscribe(cb: () => void): () => void
  saveInquiry(i: Inquiry): Promise<void>
  listInquiries?(): Promise<Inquiry[]>
  sb?: SupabaseClientLike
}

type SupabaseClientLike = unknown

const CREDS_KEY = 'abv_supabase_creds'

export function storedCreds(): SupabaseCreds | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    if (raw) {
      const c = JSON.parse(raw)
      if (c?.url && c?.key) return c
    }
  } catch {
    /* ignore */
  }
  return null
}

export function saveCreds(c: SupabaseCreds | null) {
  if (c) localStorage.setItem(CREDS_KEY, JSON.stringify(c))
  else localStorage.removeItem(CREDS_KEY)
}

export function envCreds(): SupabaseCreds | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key && url.startsWith('http')) return { url, key }
  return null
}

export function resolveCreds(): SupabaseCreds | null {
  return envCreds() ?? storedCreds()
}

export function createAdapter(): Adapter {
  const creds = resolveCreds()
  if (creds) {
    try {
      return createSupabaseAdapter(creds) as Adapter
    } catch {
      /* fall through to local */
    }
  }
  return localAdapter as Adapter
}

export const SUPABASE_SQL = `-- AB VISUALS · Supabase setup (run in the SQL editor, then create the bucket)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text default '',
  slug text default '',
  category text default '',
  location text default '',
  year text default '',
  ticket_rows jsonb default '[]'::jsonb,
  short_key text default '',
  short_desc text default '',
  full_description text default '',
  youtube_urls jsonb default '[]'::jsonb,
  preview_video_url text,
  cover_image_url text default '',
  gallery_images jsonb default '[]'::jsonb,
  sort_order int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  type text default '',
  date text default '',
  location text default '',
  message text default '',
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.site_content enable row level security;
alter table public.inquiries enable row level security;

-- Public read (portfolio is a public site)
drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects for select using (true);
drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content" on public.site_content for select using (true);
-- App-level admin gate handles writes; anon key is publishable-only
drop policy if exists "public write projects" on public.projects;
create policy "public write projects" on public.projects for all using (true) with check (true);
drop policy if exists "public write site_content" on public.site_content;
create policy "public write site_content" on public.site_content for all using (true) with check (true);
drop policy if exists "public write inquiries" on public.inquiries;
create policy "public write inquiries" on public.inquiries for insert with check (true);

-- Storage bucket (public media)
insert into storage.buckets (id, name, public)
values ('ab-visuals-media', 'ab-visuals-media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'ab-visuals-media');
drop policy if exists "media public write" on storage.objects;
create policy "media public write" on storage.objects
  for all using (bucket_id = 'ab-visuals-media') with check (bucket_id = 'ab-visuals-media');`
