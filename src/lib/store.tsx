import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Project, SiteContent, Inquiry, uid, slugify } from './types'
import { DEFAULT_CONTENT, seedProjects } from './seed'
import { Adapter, createAdapter } from './db'
import { localAdapter, localResolve, preloadLocal, collectLocalUrls } from './dbLocal'

export interface Toast {
  id: string
  msg: string
}

interface Store {
  ready: boolean
  mode: 'local' | 'supabase'
  adapter: Adapter
  projects: Project[]
  content: SiteContent
  toasts: Toast[]
  toast: (msg: string) => void
  saveProject: (p: Project) => Promise<void>
  createProject: () => Promise<string>
  deleteProject: (id: string) => Promise<void>
  moveProject: (id: string, dir: -1 | 1) => Promise<void>
  saveContent: (c: SiteContent) => Promise<void>
  resetContent: () => Promise<void>
  saveInquiry: (i: Omit<Inquiry, 'id'>) => Promise<void>
  listInquiries: () => Promise<Inquiry[]>
  refresh: () => Promise<void>
  reconnect: () => Promise<void>
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [adapter, setAdapter] = useState<Adapter>(() => createAdapter())
  const [ready, setReady] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT)
  const [toasts, setToasts] = useState<Toast[]>([])
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter

  const toast = useCallback((msg: string) => {
    const t = { id: uid(), msg }
    setToasts((ts) => [...ts, t])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 2600)
  }, [])

  const load = useCallback(async (ad: Adapter) => {
    let ps: Project[]
    let ct: SiteContent | null
    try {
      ;[ps, ct] = await Promise.all([ad.getProjects(), ad.getContent()])
    } catch (e) {
      console.error('Backend load failed, switching to local mode', e)
      ad = createAdapterMode()
      ;[ps, ct] = await Promise.all([ad.getProjects(), ad.getContent()])
      setAdapter(ad)
      adapterRef.current = ad
    }
    // Fresh / empty Supabase project → seed defaults once
    if (ct === null) {
      ct = DEFAULT_CONTENT
      try {
        await ad.saveContent(ct)
      } catch {
        /* ignore */
      }
    }
    if (!ps || ps.length === 0) {
      ps = await seedOnce(ad)
    }
    ps = [...ps].sort((a, b) => a.sort_order - b.sort_order)
    setProjects(ps)
    setContent(ct)
    if (ad.mode === 'local') {
      preloadLocal(collectLocalUrls(ps, ct))
    }
    setReady(true)
  }, [])

  useEffect(() => {
    load(adapter)
    const unsub = adapter.subscribe(() => load(adapter))
    return unsub
  }, [adapter, load])

  const saveProject = useCallback(
    async (p: Project) => {
      setProjects((ps) => {
        const i = ps.findIndex((x) => x.id === p.id)
        const next = [...ps]
        if (i >= 0) next[i] = p
        else next.push(p)
        return next.sort((a, b) => a.sort_order - b.sort_order)
      })
      try {
        await adapterRef.current.saveProject(p)
      } catch (e) {
        console.error(e)
        toast('Could not save project')
      }
    },
    [toast],
  )

  const createProject = useCallback(async () => {
    const p: Project = {
      id: uid(),
      title: 'NEW PROJECT',
      slug: slugify('New Project ' + Date.now()),
      category: 'Wedding Cinematography',
      location: 'Mumbai, India',
      year: String(new Date().getFullYear()),
      ticket_rows: ['WEDDING CINEMA', 'AERIAL & GROUND', String(new Date().getFullYear())],
      short_key: '// new project',
      short_desc: '— a brand new AB VISUALS production. Add the story, photos and videos.',
      full_description: '',
      youtube_urls: [],
      preview_video_url: '',
      cover_image_url: '',
      gallery_images: [],
      sort_order: projects.length,
      is_published: false,
      created_at: new Date().toISOString(),
    }
    setProjects((ps) => [...ps, p])
    await adapterRef.current.saveProject(p)
    return p.id
  }, [projects.length])

  const deleteProject = useCallback(async (id: string) => {
    setProjects((ps) => ps.filter((p) => p.id !== id))
    try {
      await adapterRef.current.deleteProject(id)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const moveProject = useCallback(
    async (id: string, dir: -1 | 1) => {
      const ps = [...projects].sort((a, b) => a.sort_order - b.sort_order)
      const i = ps.findIndex((p) => p.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= ps.length) return
      const a = ps[i]
      const b = ps[j]
      const swapped = ps.map((p) => {
        if (p.id === a.id) return { ...p, sort_order: b.sort_order }
        if (p.id === b.id) return { ...p, sort_order: a.sort_order }
        return p
      })
      setProjects(swapped)
      await Promise.all([adapterRef.current.saveProject({ ...a, sort_order: b.sort_order }), adapterRef.current.saveProject({ ...b, sort_order: a.sort_order })]).catch((e) => console.error(e))
    },
    [projects],
  )

  const saveContent = useCallback(async (c: SiteContent) => {
    setContent(c)
    try {
      await adapterRef.current.saveContent(c)
    } catch (e) {
      console.error(e)
      toast('Could not save content')
    }
  }, [toast])

  const resetContent = useCallback(async () => {
    await saveContent(DEFAULT_CONTENT)
    toast('Text reset to defaults')
  }, [saveContent, toast])

  const saveInquiry = useCallback(async (i: Omit<Inquiry, 'id'>) => {
    try {
      await adapterRef.current.saveInquiry(i)
    } catch {
      /* ignore */
    }
  }, [])

  const listInquiries = useCallback(async () => {
    if (adapterRef.current.listInquiries) {
      try {
        return await adapterRef.current.listInquiries()
      } catch {
        return []
      }
    }
    return []
  }, [])

  const refresh = useCallback(async () => {
    await load(adapterRef.current)
  }, [load])

  const reconnect = useCallback(async () => {
    const ad = createAdapter()
    setAdapter(ad)
    adapterRef.current = ad
    await load(ad)
  }, [load])

  return (
    <Ctx.Provider
      value={{
        ready,
        mode: adapter.mode,
        adapter,
        projects,
        content,
        toasts,
        toast,
        saveProject,
        createProject,
        deleteProject,
        moveProject,
        saveContent,
        resetContent,
        saveInquiry,
        listInquiries,
        refresh,
        reconnect,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

function createAdapterMode(): Adapter {
  // local fallback used when the cloud load throws
  return localAdapter
}

async function seedOnce(ad: Adapter): Promise<Project[]> {
  const ps = seedProjects()
  for (const p of ps) {
    try {
      await ad.saveProject(p)
    } catch {
      /* ignore */
    }
  }
  return ps
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}

/** Resolve a (possibly local://) image url to something <img> can load. */
export function useResolvedUrl(url: string | undefined): string {
  const { mode } = useStore()
  const [out, setOut] = useState(url || '')
  useEffect(() => {
    let alive = true
    if (!url) {
      setOut('')
      return
    }
    if (mode === 'local' && url.startsWith('local://')) {
      localResolve(url).then((u) => {
        if (alive) setOut(u)
      })
    } else {
      setOut(url)
    }
    return () => {
      alive = false
    }
  }, [url, mode])
  return out
}

/** Build a WhatsApp click-to-chat URL from contact settings. */
export function waLink(content: SiteContent, message?: string): string {
  const custom = content.socials.whatsappUrl
  if (custom && !custom.includes('wa.me/919876543210')) return custom
  const num = (content.contact.whatsappNumber || '').replace(/[^0-9]/g, '')
  const msg = encodeURIComponent(message || content.contact.whatsappGreeting || 'Hi AB VISUALS!')
  return `https://wa.me/${num}?text=${msg}`
}
