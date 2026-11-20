import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Project, SiteContent, Inquiry } from './types'

export interface SupabaseCreds {
  url: string
  key: string
}

export function createSupabaseAdapter(creds: SupabaseCreds) {
  const sb: SupabaseClient = createClient(creds.url, creds.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const adapter = {
    mode: 'supabase' as const,
    sb,
    async getProjects(): Promise<Project[]> {
      const { data, error } = await sb
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data as Project[]) ?? []
    },
    async saveProject(p: Project) {
      const { error } = await sb.from('projects').upsert(p as never, { onConflict: 'id' })
      if (error) throw error
    },
    async deleteProject(id: string) {
      const { error } = await sb.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    async getContent(): Promise<SiteContent | null> {
      const { data, error } = await sb
        .from('site_content')
        .select('data')
        .eq('id', 'main')
        .maybeSingle()
      if (error) throw error
      return (data?.data as SiteContent) ?? null
    },
    async saveContent(content: SiteContent) {
      const { error } = await sb
        .from('site_content')
        .upsert({ id: 'main', data: content }, { onConflict: 'id' })
      if (error) throw error
    },
    async upload(blob: Blob, name: string, onProgress?: (p: number) => void): Promise<string> {
      const safe = name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`
      for (let p = 0.5; p < 0.9; p += 0.1) {
        await new Promise((r) => setTimeout(r, 50))
        onProgress?.(p)
      }
      const { error } = await sb.storage.from('ab-visuals-media').upload(path, blob, {
        contentType: blob.type || 'image/webp',
        upsert: true,
      })
      if (error) throw error
      onProgress?.(1)
      const { data } = sb.storage.from('ab-visuals-media').getPublicUrl(path)
      return data.publicUrl
    },
    async deleteImage(url: string) {
      const marker = '/object/public/ab-visuals-media/'
      const i = url.indexOf(marker)
      if (i < 0) return
      const path = url.slice(i + marker.length).split('?')[0]
      await sb.storage.from('ab-visuals-media').remove([path]).catch(() => {})
    },
    subscribe(cb: () => void) {
      const ch = sb
        .channel('abv-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => cb())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => cb())
        .subscribe()
      return () => {
        sb.removeChannel(ch)
      }
    },
    async saveInquiry(inq: Inquiry) {
      try {
        await sb.from('inquiries').insert(inq)
      } catch {
        /* table may not exist yet */
      }
    },
    async listInquiries() {
      const { data } = await sb.from('inquiries').select('*').order('created_at', { ascending: false }).limit(100)
      return (data as Inquiry[]) ?? []
    },
  }
  return adapter
}

export type SupabaseAdapter = ReturnType<typeof createSupabaseAdapter>
