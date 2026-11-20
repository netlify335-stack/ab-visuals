import { GalleryImage, Project, SiteContent, Inquiry } from './types'
import { seedProjects, DEFAULT_CONTENT } from './seed'
import { uid } from './types'

const STATE_KEY = 'abv_state_v1'
const INQUIRY_KEY = 'abv_inquiries_v1'
const DB_NAME = 'ab-visuals-media'
const STORE = 'files'

/* ---------------- IndexedDB ---------------- */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbPut(id: string, blob: Blob): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbGet(id: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve((req.result as Blob) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function idbDel(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/* ---------------- local:// URL registry ---------------- */
const urlCache = new Map<string, string>()

export async function localResolve(url: string): Promise<string> {
  if (!url.startsWith('local://')) return url
  const id = url.slice('local://'.length)
  const hit = urlCache.get(id)
  if (hit) return hit
  const blob = await idbGet(id)
  if (!blob) return url
  const obj = URL.createObjectURL(blob)
  urlCache.set(id, obj)
  return obj
}

export function localCachePut(url: string, blob: Blob) {
  const id = url.replace(/^local:\/\//, '')
  const obj = URL.createObjectURL(blob)
  urlCache.set(id, obj)
  return obj
}

/* ---------------- state ---------------- */
interface State {
  projects: Project[]
  content: SiteContent
}

export function readState(): State {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && Array.isArray(s.projects) && s.content) return s
    }
  } catch {
    /* corrupted -> reseed */
  }
  const seeded: State = { projects: seedProjects(), content: DEFAULT_CONTENT }
  writeState(seeded)
  return seeded
}

export function writeState(s: State) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s))
  localStorage.setItem('abv-sync', String(Date.now()))
}

/* ---------------- adapter ---------------- */
export const localAdapter = {
  mode: 'local' as const,
  async getProjects() {
    return readState().projects
  },
  async saveProject(p: Project) {
    const s = readState()
    const i = s.projects.findIndex((x) => x.id === p.id)
    if (i >= 0) s.projects[i] = p
    else s.projects.push(p)
    s.projects.sort((a, b) => a.sort_order - b.sort_order)
    writeState(s)
  },
  async deleteProject(id: string) {
    const s = readState()
    s.projects = s.projects.filter((p) => p.id !== id)
    writeState(s)
  },
  async getContent() {
    return readState().content
  },
  async saveContent(content: SiteContent) {
    const s = readState()
    s.content = content
    writeState(s)
  },
  async upload(blob: Blob, name: string, onProgress?: (p: number) => void): Promise<string> {
    const id = uid()
    for (let p = 0.55; p < 0.95; p += 0.12) {
      await new Promise((r) => setTimeout(r, 60))
      onProgress?.(Math.min(0.95, p))
    }
    await idbPut(id, blob)
    onProgress?.(1)
    return `local://${id}`
  },
  async deleteImage(url: string) {
    if (url.startsWith('local://')) {
      const id = url.slice('local://'.length)
      await idbDel(id).catch(() => {})
      const cached = urlCache.get(id)
      if (cached) {
        URL.revokeObjectURL(cached)
        urlCache.delete(id)
      }
    }
  },
  subscribe(cb: () => void) {
    const h = (e: StorageEvent) => {
      if (e.key === 'abv-sync') cb()
    }
    window.addEventListener('storage', h)
    return () => window.removeEventListener('storage', h)
  },
  async saveInquiry(inq: Inquiry) {
    try {
      const raw = localStorage.getItem(INQUIRY_KEY)
      const arr = raw ? JSON.parse(raw) : []
      arr.push({ ...inq, id: uid(), created_at: new Date().toISOString() })
      localStorage.setItem(INQUIRY_KEY, JSON.stringify(arr))
    } catch {
      /* ignore */
    }
  },
  async listInquiries() {
    try {
      const raw = localStorage.getItem(INQUIRY_KEY)
      return raw ? (JSON.parse(raw) as Inquiry[]) : []
    } catch {
      return []
    }
  },
}

/** Preload object URLs for a list of images (local mode). */
export async function preloadLocal(urls: (string | undefined)[]) {
  const jobs = urls.filter((u): u is string => !!u && u.startsWith('local://'))
  await Promise.all(jobs.map((u) => localResolve(u).catch(() => null)))
}

/** Collect every local image url in current state (for preloading). */
export function collectLocalUrls(projects: Project[], content: SiteContent): string[] {
  const out: string[] = []
  for (const p of projects) {
    out.push(p.cover_image_url)
    out.push(p.preview_video_url && p.preview_video_url.startsWith('local://') ? p.preview_video_url : '')
    for (const im of p.gallery_images) out.push(im.url)
  }
  out.push(content.badge.photoUrl)
  return out.filter(Boolean) as string[]
}

export type { GalleryImage }
