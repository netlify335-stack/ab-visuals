import { DEFAULT_PROJECTS, DEFAULT_SITE_CONTENT } from './defaults';
import { idb } from './idb';
import { compressImage, blobToDataUrl } from './media';
import { MEDIA_BUCKET, getClient, getSupabaseConfig } from './supabase';
import type { GalleryImage, Inquiry, Project, SiteContent, StoreMode, SupabaseConfig } from './types';

type Status = { mode: StoreMode; reason: string | null };
const LS_MODE = 'abv.mode';

let status: Status = { mode: 'local', reason: null };
let initPromise: Promise<Status> | null = null;
const mediaCache = new Map<string, string>();
const LOCAL_PREFIX = 'local-media://';

export function getStatus() {
  return status;
}

/* ------------------------------------------------------------------ init */

export async function initStore(force = false): Promise<Status> {
  if (initPromise && !force) return initPromise;
  initPromise = (async () => {
    const cfg = getSupabaseConfig();
    if (cfg) {
      const client = getClient(cfg);
      if (client) {
        try {
          const { error } = await client.from('site_content').select('id').eq('id', 'main').limit(1);
          if (error) throw new Error(error.message);
          status = { mode: 'cloud', reason: null };
          localStorage.setItem(LS_MODE, 'cloud');
          await seedCloudDefaults();
          return status;
        } catch (err) {
          status = {
            mode: 'local',
            reason:
              'Supabase reachable check failed (' +
              (err as Error).message.slice(0, 120) +
              '). Running on the local preview store.',
          };
        }
      }
    }
    status = {
      mode: 'local',
      reason: cfg ? status.reason : 'No Supabase project connected yet — using the built-in local store.',
    };
    localStorage.setItem(LS_MODE, 'local');
    await seedLocalDefaults();
    return status;
  })();
  return initPromise;
}

async function seedLocalDefaults() {
  const seeded = await idb.get<{ id: string; value: boolean }>('kv', 'seeded');
  if (seeded?.value) return;
  await idb.put('kv', { id: 'site_content', data: DEFAULT_SITE_CONTENT });
  for (const p of DEFAULT_PROJECTS) await idb.put('projects', p);
  await idb.put('kv', { id: 'seeded', value: true });
}

async function seedCloudDefaults() {
  const client = getClient();
  if (!client) return;
  try {
    const [{ data: content }, { data: projects }] = await Promise.all([
      client.from('site_content').select('id').eq('id', 'main').maybeSingle(),
      client.from('projects').select('id').limit(1),
    ]);
    if (!content) {
      await client.from('site_content').upsert({ id: 'main', data: DEFAULT_SITE_CONTENT });
    }
    if (!projects || projects.length === 0) {
      await client.from('projects').insert(DEFAULT_PROJECTS);
    }
  } catch {
    /* read-only credentials — ignore */
  }
}

/* --------------------------------------------------------------- helpers */

export function mergeSiteContent(base: SiteContent, incoming: unknown): SiteContent {
  if (!incoming || typeof incoming !== 'object') return base;
  const src = incoming as Record<string, unknown>;
  const isObj = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  const merge = (a: unknown, b: unknown): unknown => {
    if (Array.isArray(b)) return b;
    if (isObj(a) && isObj(b)) {
      const out: Record<string, unknown> = { ...a };
      for (const key of Object.keys(b)) out[key] = merge(a[key], b[key]);
      return out;
    }
    return b === undefined ? a : b;
  };
  return merge(base, src) as SiteContent;
}

async function resolveLocalUrl(url: string | undefined | null): Promise<string> {
  if (!url) return '';
  if (!url.startsWith(LOCAL_PREFIX)) return url;
  const id = url.slice(LOCAL_PREFIX.length);
  const cached = mediaCache.get(id);
  if (cached) return cached;
  const rec = await idb.get<{ id: string; blob: Blob }>('media', id);
  if (!rec) return '';
  const objectUrl = URL.createObjectURL(rec.blob);
  mediaCache.set(id, objectUrl);
  return objectUrl;
}

function unresolveUrl(url: string): string {
  if (!url || !url.startsWith('blob:')) return url;
  for (const [id, obj] of mediaCache) if (obj === url) return LOCAL_PREFIX + id;
  return url;
}

async function presentProject(p: Project): Promise<Project> {
  if (status.mode === 'cloud') return p;
  return {
    ...p,
    cover_image_url: await resolveLocalUrl(p.cover_image_url),
    gallery_images: await Promise.all(
      (p.gallery_images || []).map(async (g) => ({ ...g, url: await resolveLocalUrl(g.url) }))
    ),
  };
}

async function storeProject(p: Project): Promise<Project> {
  const clean: Project = {
    ...p,
    cover_image_url: unresolveUrl(p.cover_image_url),
    gallery_images: (p.gallery_images || []).map((g) => ({ ...g, url: unresolveUrl(g.url) })),
  };
  if (status.mode === 'cloud') {
    const client = getClient();
    if (!client) throw new Error('Supabase not configured');
    const { data, error } = await client.from('projects').upsert(clean).select().single();
    if (error) throw new Error(error.message);
    return presentProject(data as Project);
  }
  await idb.put('projects', clean);
  return presentProject(clean);
}

/* ------------------------------------------------------------- projects */

export async function loadProjects(): Promise<Project[]> {
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) return data as Project[];
    }
  }
  const rows = await idb.getAll<Project>('projects');
  const sorted = rows.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return Promise.all(sorted.map(presentProject));
}

export async function saveProject(project: Project): Promise<Project> {
  return storeProject(project);
}

export async function deleteProject(id: string): Promise<void> {
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      const { error } = await client.from('projects').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
  }
  await idb.delete('projects', id);
}

export async function saveProjectOrder(projects: Project[]): Promise<void> {
  const ordered = projects.map((p, i) => ({ ...p, sort_order: i + 1 }));
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      await Promise.all(
        ordered.map((p) => client.from('projects').update({ sort_order: p.sort_order }).eq('id', p.id))
      );
      return;
    }
  }
  for (const p of ordered) await idb.put('projects', p);
}

/* ---------------------------------------------------------- site content */

export async function loadSiteContent(): Promise<SiteContent> {
  let raw: unknown = null;
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      const { data } = await client.from('site_content').select('data').eq('id', 'main').maybeSingle();
      raw = data?.data ?? null;
    }
  } else {
    const row = await idb.get<{ id: string; data: SiteContent }>('kv', 'site_content');
    raw = row?.data ?? null;
  }
  const merged = mergeSiteContent(DEFAULT_SITE_CONTENT, raw);
  if (status.mode === 'local') {
    merged.badge = { ...merged.badge, photoUrl: await resolveLocalUrl(merged.badge.photoUrl) };
  }
  return merged;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const clean: SiteContent = {
    ...content,
    badge: { ...content.badge, photoUrl: unresolveUrl(content.badge.photoUrl || '') },
  };
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      const { error } = await client
        .from('site_content')
        .upsert({ id: 'main', data: clean, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
      return;
    }
  }
  await idb.put('kv', { id: 'site_content', data: clean });
}

/* ---------------------------------------------------------------- media */

export type UploadProgress = (percent: number) => void;

export async function uploadImage(
  file: File,
  onProgress?: UploadProgress,
  maxDim = 2048
): Promise<GalleryImage> {
  onProgress?.(4);
  const compressed = await compressImage(file, maxDim, 0.85);
  onProgress?.(18);
  const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (status.mode === 'cloud') {
    const client = getClient();
    if (!client) throw new Error('Supabase not configured');
    const path = `projects/${id}.webp`;
    let tick = 18;
    const timer = window.setInterval(() => {
      tick = Math.min(92, tick + 4);
      onProgress?.(tick);
    }, 220);
    try {
      const { error } = await client.storage
        .from(MEDIA_BUCKET)
        .upload(path, compressed.blob, { contentType: 'image/webp', upsert: true });
      if (error) throw new Error(error.message);
      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      onProgress?.(100);
      return {
        id,
        url: data.publicUrl,
        caption: '',
        width: compressed.width,
        height: compressed.height,
      };
    } finally {
      window.clearInterval(timer);
    }
  }

  await idb.put('media', { id, blob: compressed.blob });
  const objectUrl = URL.createObjectURL(compressed.blob);
  mediaCache.set(id, objectUrl);
  onProgress?.(100);
  return {
    id,
    url: objectUrl,
    caption: '',
    width: compressed.width,
    height: compressed.height,
  };
}

export async function uploadSiteImage(file: File, onProgress?: UploadProgress): Promise<string> {
  const img = await uploadImage(file, onProgress, 1200);
  return img.url;
}

export async function deleteImage(url: string): Promise<void> {
  if (!url) return;
  if (status.mode === 'cloud') {
    const client = getClient();
    if (!client) return;
    const marker = `/${MEDIA_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const path = url.slice(idx + marker.length).split('?')[0];
      await client.storage.from(MEDIA_BUCKET).remove([path]);
    }
    return;
  }
  const id = [...mediaCache.entries()].find(([, obj]) => obj === url)?.[0];
  if (id) {
    mediaCache.delete(id);
    await idb.delete('media', id);
    URL.revokeObjectURL(url);
  } else if (url.startsWith(LOCAL_PREFIX)) {
    await idb.delete('media', url.slice(LOCAL_PREFIX.length));
  }
}

/* -------------------------------------------------------------- inquiries */

export async function addInquiry(inquiry: Inquiry): Promise<void> {
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      const { error } = await client.from('inquiries').insert({
        name: inquiry.name,
        phone: inquiry.phone,
        shoot_type: inquiry.shoot_type,
        shoot_date: inquiry.shoot_date,
        location: inquiry.location,
        message: inquiry.message,
      });
      if (error) throw new Error(error.message);
      return;
    }
  }
  await idb.put('inquiries', { ...inquiry, id: `inq-${Date.now()}`, created_at: new Date().toISOString() });
}

export async function loadInquiries(): Promise<Inquiry[]> {
  if (status.mode === 'cloud') {
    const client = getClient();
    if (client) {
      const { data, error } = await client
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) return data as Inquiry[];
    }
  }
  const rows = await idb.getAll<Inquiry & { id: string }>('inquiries');
  return rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/* ------------------------------------------------------------ cloud tests */

export async function testCloudConfig(cfg: SupabaseConfig): Promise<{ ok: boolean; message: string }> {
  const client = getClient(cfg);
  if (!client) return { ok: false, message: 'Missing URL or anon key.' };
  try {
    const { error } = await client.from('site_content').select('id').limit(1);
    if (error) {
      if (/does not exist|schema cache|relation/i.test(error.message)) {
        return {
          ok: false,
          message: 'Connected, but the tables are missing. Run the SQL migration in Supabase first.',
        };
      }
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Cloud connection live — projects and media will sync for every visitor.' };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

/* ------------------------------------------------------------------ backup */

export async function exportBackup() {
  const [projects, content, inquiries] = await Promise.all([
    loadProjects(),
    loadSiteContent(),
    loadInquiries(),
  ]);
  return {
    app: 'AB VISUALS CMS',
    version: 1,
    exported_at: new Date().toISOString(),
    site_content: content,
    projects,
    inquiries,
  };
}

export async function importBackup(payload: {
  site_content?: unknown;
  projects?: Project[];
}): Promise<void> {
  if (payload.site_content) {
    await saveSiteContent(mergeSiteContent(DEFAULT_SITE_CONTENT, payload.site_content));
  }
  if (Array.isArray(payload.projects)) {
    if (status.mode === 'cloud') {
      const client = getClient();
      if (client) await client.from('projects').upsert(payload.projects);
    } else {
      await idb.clear('projects');
      for (const p of payload.projects) await idb.put('projects', p);
    }
  }
}

export async function resetSiteContent(): Promise<SiteContent> {
  await saveSiteContent(DEFAULT_SITE_CONTENT);
  return DEFAULT_SITE_CONTENT;
}

export async function resetAllLocal(): Promise<void> {
  await idb.clear('projects');
  await idb.clear('media');
  await idb.clear('kv');
  location.reload();
}

export { blobToDataUrl };
