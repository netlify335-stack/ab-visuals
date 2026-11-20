import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { Project, SiteContent, Inquiry, uid } from '../lib/types'
import { DEFAULT_CONTENT } from '../lib/seed'
import { compressImage } from '../lib/image'
import { ytId, ytCinemaEmbed } from '../lib/youtube'
import { SUPABASE_SQL, saveCreds, storedCreds } from '../lib/db'
import { RImg } from '../home/RImg'

/* ---------------- auth ---------------- */
const PW_KEY = 'abv_admin_pw'
const SESSION_KEY = 'abv_admin_session'
const DEFAULT_PW = 'amit231106'

function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
const getPw = () => localStorage.getItem(PW_KEY) ?? hash(DEFAULT_PW)
const checkPw = (p: string) => hash(p) === getPw()

function Login({ onOk }: { onOk: () => void }) {
  const [v, setV] = useState('')
  const [err, setErr] = useState(false)
  return (
    <div className="ad-login">
      <form
        className="ad-login-card"
        onSubmit={(e) => {
          e.preventDefault()
          if (checkPw(v)) {
            sessionStorage.setItem(SESSION_KEY, '1')
            onOk()
          } else {
            setErr(true)
            setTimeout(() => setErr(false), 600)
          }
        }}
      >
        <h1>AB VISUALS</h1>
        <p>Studio Admin · Control Panel</p>
        <input
          className="inp"
          type="password"
          placeholder="Admin passcode"
          value={v}
          onChange={(e) => setV(e.target.value)}
          style={err ? { outline: '2px solid #ff8080' } : undefined}
          autoFocus
        />
        <div style={{ height: 12 }} />
        <button className="btn mint" style={{ width: '100%', justifyContent: 'center' }} type="submit">
          Unlock Dashboard
        </button>
        <div className="hintline">Default passcode: {DEFAULT_PW} · change it anytime in Settings</div>
      </form>
    </div>
  )
}

/* ---------------- shared bits ---------------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="f">
      <span>{label}</span>
      {children}
    </label>
  )
}

interface UploadQueueItem {
  id: string
  name: string
  progress: number
  status: 'working' | 'done' | 'error'
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const { mode, toast } = useStore()
  const [tab, setTab] = useState<'projects' | 'contact' | 'content' | 'settings'>('projects')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  if (!authed) return <Login onOk={() => setAuthed(true)} />

  const goSite = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="ad">
      <div className="ad-top">
        <div className="ad-brand">
          <b>AB VISUALS · STUDIO ADMIN</b>
          <span className={'ad-mode ' + (mode === 'supabase' ? 'cloud' : '')}>
            {mode === 'supabase' ? 'SUPABASE CLOUD' : 'LOCAL PREVIEW'}
          </span>
        </div>
        <div className="ad-nav">
          <button className={tab === 'projects' ? 'on' : ''} onClick={() => setTab('projects')}>
            Projects
          </button>
          <button className={tab === 'contact' ? 'on' : ''} onClick={() => setTab('contact')}>
            Contact & Socials
          </button>
          <button className={tab === 'content' ? 'on' : ''} onClick={() => setTab('content')}>
            Text & Services
          </button>
          <button className={tab === 'settings' ? 'on' : ''} onClick={() => setTab('settings')}>
            Settings & Backup
          </button>
        </div>
        <div className="ad-row">
          <button className="btn sm" onClick={goSite}>
            View Site →
          </button>
          <button
            className="btn sm ghost"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY)
              setAuthed(false)
            }}
          >
            Log out
          </button>
        </div>
      </div>
      <div className="ad-wrap">
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'contact' && <ContactTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

/* ================================================================
   Projects
   ================================================================ */
function ProjectsTab() {
  const { projects, saveProject, createProject, deleteProject, moveProject, adapter, content, toast } = useStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Project | null>(null)
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [ytInput, setYtInput] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order)
  const editing = editId ? projects.find((p) => p.id === editId) : null

  useEffect(() => {
    if (!editId) {
      setDraft(null)
      return
    }
    const src = projects.find((p) => p.id === editId)
    if (src) {
      setDraft({
        ...src,
        ticket_rows: [...src.ticket_rows],
        youtube_urls: [...src.youtube_urls],
        gallery_images: src.gallery_images.map((g) => ({ ...g })),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  async function handleFiles(files: FileList | File[]) {
    if (!draft) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const qid = uid()
      setQueue((q) => [...q, { id: qid, name: file.name, progress: 0, status: 'working' }])
      try {
        const { blob, width, height } = await compressImage(file)
        const url = await adapter.upload(blob, file.name, (p) =>
          setQueue((q) => q.map((x) => (x.id === qid ? { ...x, progress: p } : x))),
        )
        setDraft((d) => {
          if (!d) return d
          const gallery_images = [...d.gallery_images, { id: uid(), url, caption: '', width, height }]
          return { ...d, gallery_images, cover_image_url: d.cover_image_url || url }
        })
        setQueue((q) => q.map((x) => (x.id === qid ? { ...x, progress: 1, status: 'done' } : x)))
      } catch (e) {
        console.error(e)
        setQueue((q) => q.map((x) => (x.id === qid ? { ...x, status: 'error' } : x)))
        toast('Upload failed for ' + file.name)
      }
    }
    setTimeout(() => setQueue((q) => q.filter((x) => x.status === 'working')), 5000)
  }

  async function saveDraft() {
    if (!draft) return
    const toSave = { ...draft, slug: draft.slug || slugifySafe(draft.title) }
    setDraft(toSave)
    await saveProject(toSave)
    toast('Project saved · live on site')
  }

  async function removeImage(id: string) {
    if (!draft) return
    const img = draft.gallery_images.find((g) => g.id === id)
    if (img) await adapter.deleteImage(img.url).catch(() => {})
    setDraft({
      ...draft,
      gallery_images: draft.gallery_images.filter((g) => g.id !== id),
      cover_image_url: draft.cover_image_url === img?.url ? '' : draft.cover_image_url,
    })
  }

  function moveImg(id: string, dir: -1 | 1) {
    if (!draft) return
    const arr = [...draft.gallery_images]
    const i = arr.findIndex((g) => g.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    const [x] = arr.splice(i, 1)
    arr.splice(j, 0, x)
    setDraft({ ...draft, gallery_images: arr })
  }

  const ytIds = draft ? draft.youtube_urls.map((u) => ytId(u)).filter(Boolean) : []

  if (editId && draft) {
    const d = draft
    const set = (patch: Partial<Project>) => setDraft({ ...d, ...patch })
    return (
      <div>
        <div className="ad-row" style={{ marginBottom: 16, justifyContent: 'space-between' }}>
          <button className="btn ghost" onClick={() => setEditId(null)}>
            ← All projects
          </button>
          <div className="ad-row">
            <button className="btn sm ghost" onClick={() => set({ is_published: !d.is_published })}>
              {d.is_published ? '● Published' : '○ Draft'}
            </button>
            <button className="btn mint" onClick={saveDraft}>
              Save Project
            </button>
          </div>
        </div>

        <div className="ad-grid2">
          <div className="ad-card">
            <h3>Project details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Title">
                <input className="inp" value={d.title} onChange={(e) => set({ title: e.target.value })} />
              </Field>
              <Field label="Service category">
                <input
                  className="inp"
                  list="svc-list"
                  value={d.category}
                  onChange={(e) => set({ category: e.target.value })}
                />
                <datalist id="svc-list">
                  {content.services.map((s) => (
                    <option key={s.id} value={s.title} />
                  ))}
                </datalist>
              </Field>
              <div className="ad-grid2">
                <Field label="Location">
                  <input className="inp" value={d.location} onChange={(e) => set({ location: e.target.value })} />
                </Field>
                <Field label="Year">
                  <input className="inp" value={d.year} onChange={(e) => set({ year: e.target.value })} />
                </Field>
              </div>
              <Field label="Ticket row 1">
                <input
                  className="inp"
                  value={d.ticket_rows[0] || ''}
                  onChange={(e) => set({ ticket_rows: [e.target.value, d.ticket_rows[1] || '', d.ticket_rows[2] || ''] })}
                />
              </Field>
              <Field label="Ticket row 2">
                <input
                  className="inp"
                  value={d.ticket_rows[1] || ''}
                  onChange={(e) => set({ ticket_rows: [d.ticket_rows[0] || '', e.target.value, d.ticket_rows[2] || ''] })}
                />
              </Field>
              <Field label="Ticket row 3">
                <input
                  className="inp"
                  value={d.ticket_rows[2] || ''}
                  onChange={(e) => set({ ticket_rows: [d.ticket_rows[0] || '', d.ticket_rows[1] || '', e.target.value] })}
                />
              </Field>
              <Field label="Short key (laptop view)">
                <input className="inp" value={d.short_key} onChange={(e) => set({ short_key: e.target.value })} />
              </Field>
              <Field label="Short summary">
                <textarea className="ta" rows={2} value={d.short_desc} onChange={(e) => set({ short_desc: e.target.value })} />
              </Field>
              <Field label="Full project story">
                <textarea className="ta" rows={5} value={d.full_description} onChange={(e) => set({ full_description: e.target.value })} />
              </Field>
              <Field label="Direct MP4 preview URL (optional)">
                <input
                  className="inp"
                  placeholder="https://…/preview.mp4"
                  value={d.preview_video_url || ''}
                  onChange={(e) => set({ preview_video_url: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="ad-card">
              <h3>YouTube videos</h3>
              <div className="ad-row">
                <input
                  className="inp"
                  placeholder="Paste any YouTube link — watch, youtu.be, shorts…"
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addYt()
                    }
                  }}
                />
                <button className="btn sm" onClick={addYt}>
                  + Add Video
                </button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.youtube_urls.map((u, i) => {
                  const id = ytId(u)
                  return (
                    <div key={i} className="ad-row" style={{ justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'rgba(215,232,222,.7)', wordBreak: 'break-all' }}>
                        {id ? '▶ ' : '⚠ '}
                        {u}
                      </span>
                      <button className="iconbtn danger" onClick={() => set({ youtube_urls: d.youtube_urls.filter((_, j) => j !== i) })}>
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
              {ytIds.length > 0 && (
                <div className="yt-preview">
                  <div className="cinema-main">
                    <iframe src={ytCinemaEmbed(ytIds[0]!)} title="YouTube preview" allow="autoplay; encrypted-media" allowFullScreen />
                  </div>
                </div>
              )}
            </div>

            <div className="ad-card">
              <h3>Cover photo</h3>
              <div className="ad-row" style={{ justifyContent: 'space-between' }}>
                <RImg src={d.cover_image_url} seed={'cover-' + d.id} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                <span style={{ fontSize: 12, color: 'rgba(215,232,222,.6)' }}>
                  Use “Set Cover” on any photo below, or upload a new one.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <h3>Photos · unlimited ({d.gallery_images.length})</h3>
          <div
            className={'drop' + (dragOver ? ' over' : '')}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
          >
            <b>Upload photos from phone or computer</b>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Tap or drag & drop · select 10, 30, 50+ at once · auto-compressed to WebP
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {queue.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {queue.map((q) => (
                <div key={q.id}>
                  <div className="ad-row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12 }}>{q.name}</span>
                    <span style={{ fontSize: 11, color: q.status === 'error' ? '#ff9c9c' : 'rgba(215,232,222,.6)' }}>
                      {q.status === 'done' ? 'Uploaded ✓' : q.status === 'error' ? 'Failed' : Math.round(q.progress * 100) + '%'}
                    </span>
                  </div>
                  <div className="upl-prog">
                    <i style={{ width: q.status === 'error' ? '100%' : q.progress * 100 + '%', background: q.status === 'error' ? '#ff8080' : undefined }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="upl-grid">
            {d.gallery_images.map((im) => (
              <div key={im.id} className={'upl-item' + (d.cover_image_url === im.url ? ' cover' : '')}>
                <RImg src={im.url} seed={im.id} alt={im.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="upl-acts">
                  {d.cover_image_url !== im.url && (
                    <button
                      onClick={() => {
                        set({ cover_image_url: im.url })
                        toast('Cover updated')
                      }}
                    >
                      Set Cover
                    </button>
                  )}
                  <button onClick={() => moveImg(im.id, -1)}>←</button>
                  <button onClick={() => moveImg(im.id, 1)}>→</button>
                  <button
                    onClick={() => {
                      const c = window.prompt('Photo caption (optional)', im.caption || '')
                      if (c !== null) {
                        set({ gallery_images: d.gallery_images.map((g) => (g.id === im.id ? { ...g, caption: c } : g)) })
                      }
                    }}
                  >
                    ✎
                  </button>
                  <button className="del" onClick={() => removeImage(im.id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          {d.gallery_images.length === 0 && (
            <div style={{ fontSize: 12, color: 'rgba(215,232,222,.5)', marginTop: 10 }}>
              No photos yet — upload your first batch above.
            </div>
          )}
        </div>

        <div className="ad-row" style={{ marginTop: 18, justifyContent: 'space-between' }}>
          <button
            className="btn danger"
            onClick={async () => {
              await deleteProject(d.id)
              toast('Project deleted')
              setEditId(null)
            }}
          >
            Delete project
          </button>
          <button className="btn mint" onClick={saveDraft}>
            Save Project
          </button>
        </div>
      </div>
    )
  }

  function addYt() {
    const v = ytInput.trim()
    if (!v) return
    const id = ytId(v)
    if (!id) {
      toast('Could not parse that YouTube link')
      return
    }
    if (draft?.youtube_urls.includes(v)) return
    setDraft((d) => (d ? { ...d, youtube_urls: [...d.youtube_urls, v] } : d))
    setYtInput('')
  }

  return (
    <div>
      <div className="ad-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Projects · {sorted.length}</h3>
        <button
          className="btn mint"
          onClick={async () => {
            const id = await createProject()
            setEditId(id)
          }}
        >
          + Create New Project
        </button>
      </div>
      <div className="proj-list">
        {sorted.map((p, i) => (
          <div className="proj-item" key={p.id}>
            <RImg src={p.cover_image_url} seed={'pi-' + i + '-' + p.id} alt={p.title} />
            <div className="pi-meta">
              <b>{p.title}</b>
              <span>
                {p.category} · {p.gallery_images.length} photos
                {p.youtube_urls.length ? ` · ${p.youtube_urls.length} YouTube` : ''}
                {p.preview_video_url ? ' · MP4' : ''}
              </span>
            </div>
            <span className={'pi-badge ' + (p.is_published ? 'pub' : 'draft')}>{p.is_published ? 'LIVE' : 'DRAFT'}</span>
            <div className="pi-actions">
              <button className="iconbtn" disabled={i === 0} onClick={() => moveProject(p.id, -1)} title="Move up">
                ↑
              </button>
              <button className="iconbtn" disabled={i === sorted.length - 1} onClick={() => moveProject(p.id, 1)} title="Move down">
                ↓
              </button>
              <button
                className="iconbtn"
                onClick={() => {
                  const src = projects.find((x) => x.id === p.id)
                  if (src) {
                    saveProject({ ...src, is_published: !src.is_published })
                    toast(src.is_published ? 'Moved to draft' : 'Published · live on site')
                  }
                }}
              >
                {p.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button className="iconbtn" onClick={() => setEditId(p.id)}>
                Edit
              </button>
              {confirmDel === p.id ? (
                <button
                  className="iconbtn danger"
                  onClick={async () => {
                    await deleteProject(p.id)
                    setConfirmDel(null)
                    toast('Project deleted')
                  }}
                  onMouseLeave={() => setConfirmDel(null)}
                >
                  Confirm?
                </button>
              ) : (
                <button className="iconbtn danger" onClick={() => setConfirmDel(p.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function slugifySafe(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project'
}

/* ================================================================
   Contact & socials
   ================================================================ */
function ContactTab() {
  const { content, saveContent, toast } = useStore()
  const [c, setC] = useState<SiteContent>(() => cloneContent(content))
  const set = (fn: (c: SiteContent) => void) => setC((prev) => {
    const next = cloneContent(prev)
    fn(next)
    return next
  })
  return (
    <div>
      <div className="ad-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Contact & Social Links</h3>
        <button
          className="btn mint"
          onClick={async () => {
            await saveContent(c)
            toast('Contact settings saved · live everywhere')
          }}
        >
          Save Changes
        </button>
      </div>

      <div className="ad-card">
        <h3>Brand & pilot</h3>
        <div className="ad-grid2">
          <Field label="Brand / pilot name">
            <input className="inp" value={c.contact.name} onChange={(e) => set((x) => (x.contact.name = e.target.value))} />
          </Field>
          <Field label="Phone number">
            <input className="inp" value={c.contact.phone} onChange={(e) => set((x) => (x.contact.phone = e.target.value))} />
          </Field>
          <Field label="WhatsApp number (country code, digits)">
            <input className="inp" value={c.contact.whatsappNumber} onChange={(e) => set((x) => (x.contact.whatsappNumber = e.target.value))} />
          </Field>
          <Field label="Default WhatsApp greeting">
            <input className="inp" value={c.contact.whatsappGreeting} onChange={(e) => set((x) => (x.contact.whatsappGreeting = e.target.value))} />
          </Field>
          <Field label="Email">
            <input className="inp" value={c.contact.email} onChange={(e) => set((x) => (x.contact.email = e.target.value))} />
          </Field>
          <Field label="Studio city / address">
            <input className="inp" value={c.contact.city} onChange={(e) => set((x) => (x.contact.city = e.target.value))} />
          </Field>
          <Field label="Availability line">
            <input className="inp" value={c.contact.availability} onChange={(e) => set((x) => (x.contact.availability = e.target.value))} />
          </Field>
          <Field label="Badge short contact (phone or email)">
            <input className="inp" value={c.contact.phoneOrEmailShort} onChange={(e) => set((x) => (x.contact.phoneOrEmailShort = e.target.value))} />
          </Field>
        </div>
      </div>

      <div className="ad-card">
        <h3>Bottom social bar (sabse niche)</h3>
        <div className="ad-grid3">
          <Field label="Instagram URL">
            <input className="inp" value={c.socials.instagramUrl} onChange={(e) => set((x) => (x.socials.instagramUrl = e.target.value))} />
          </Field>
          <Field label="Instagram label">
            <input className="inp" value={c.socials.instagramLabel} onChange={(e) => set((x) => (x.socials.instagramLabel = e.target.value))} />
          </Field>
          <Field label="Show Instagram">
            <label className="switch">
              <input type="checkbox" checked={c.socials.instagramShow} onChange={(e) => set((x) => (x.socials.instagramShow = e.target.checked))} />
              <i />
            </label>
          </Field>
          <Field label="YouTube URL">
            <input className="inp" value={c.socials.youtubeUrl} onChange={(e) => set((x) => (x.socials.youtubeUrl = e.target.value))} />
          </Field>
          <Field label="YouTube label">
            <input className="inp" value={c.socials.youtubeLabel} onChange={(e) => set((x) => (x.socials.youtubeLabel = e.target.value))} />
          </Field>
          <Field label="Show YouTube">
            <label className="switch">
              <input type="checkbox" checked={c.socials.youtubeShow} onChange={(e) => set((x) => (x.socials.youtubeShow = e.target.checked))} />
              <i />
            </label>
          </Field>
          <Field label="WhatsApp direct link">
            <input className="inp" value={c.socials.whatsappUrl} onChange={(e) => set((x) => (x.socials.whatsappUrl = e.target.value))} />
          </Field>
          <Field label="WhatsApp label">
            <input className="inp" value={c.socials.whatsappLabel} onChange={(e) => set((x) => (x.socials.whatsappLabel = e.target.value))} />
          </Field>
          <Field label="Show WhatsApp">
            <label className="switch">
              <input type="checkbox" checked={c.socials.whatsappShow} onChange={(e) => set((x) => (x.socials.whatsappShow = e.target.checked))} />
              <i />
            </label>
          </Field>
        </div>
      </div>

      <div className="ad-card">
        <h3>Drawer headings & CTA</h3>
        <div className="ad-grid3">
          <Field label="Heading">
            <input className="inp" value={c.drawer.heading} onChange={(e) => set((x) => (x.drawer.heading = e.target.value))} />
          </Field>
          <Field label="Subheading">
            <input className="inp" value={c.drawer.subheading} onChange={(e) => set((x) => (x.drawer.subheading = e.target.value))} />
          </Field>
          <Field label="CTA button text">
            <input className="inp" value={c.drawer.ctaText} onChange={(e) => set((x) => (x.drawer.ctaText = e.target.value))} />
          </Field>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   Text & services
   ================================================================ */
function ContentTab() {
  const { content, saveContent, adapter, resetContent, toast } = useStore()
  const [c, setC] = useState<SiteContent>(() => cloneContent(content))
  const [badgeUploading, setBadgeUploading] = useState(false)
  const set = (fn: (c: SiteContent) => void) => setC((prev) => {
    const next = cloneContent(prev)
    fn(next)
    return next
  })

  async function uploadBadgePhoto(file: File) {
    setBadgeUploading(true)
    try {
      const { blob } = await compressImage(file, 1024, 0.9)
      const url = await adapter.upload(blob, 'badge-' + file.name)
      set((x) => (x.badge.photoUrl = url))
      toast('Badge photo updated')
    } catch {
      toast('Badge photo upload failed')
    } finally {
      setBadgeUploading(false)
    }
  }

  return (
    <div>
      <div className="ad-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Website Text & Services</h3>
        <div className="ad-row">
          <button className="btn ghost" onClick={resetContent}>
            Reset text to defaults
          </button>
          <button
            className="btn mint"
            onClick={async () => {
              await saveContent(c)
              toast('Site text saved · live on home')
            }}
          >
            Save All Text
          </button>
        </div>
      </div>

      <div className="ad-card">
        <h3>Home hero texts</h3>
        <div className="ad-grid3">
          <Field label="Giant wordmark">
            <input className="inp" value={c.hero.wordmark} onChange={(e) => set((x) => (x.hero.wordmark = e.target.value))} />
          </Field>
          <Field label="Handwritten script tagline">
            <input className="inp" value={c.hero.script} onChange={(e) => set((x) => (x.hero.script = e.target.value))} />
          </Field>
          <Field label="Scroll hint">
            <input className="inp" value={c.hero.scrollHint} onChange={(e) => set((x) => (x.hero.scrollHint = e.target.value))} />
          </Field>
        </div>
      </div>

      <div className="ad-card">
        <h3>Lanyard ID badge</h3>
        <div className="ad-grid3">
          <Field label="Badge heading (use Enter for 2 lines)">
            <textarea className="ta" rows={2} value={c.badge.heading} onChange={(e) => set((x) => (x.badge.heading = e.target.value))} />
          </Field>
          <Field label="Badge year">
            <input className="inp" value={c.badge.year} onChange={(e) => set((x) => (x.badge.year = e.target.value))} />
          </Field>
          <Field label="Role subtitle">
            <input className="inp" value={c.badge.role} onChange={(e) => set((x) => (x.badge.role = e.target.value))} />
          </Field>
        </div>
        <div className="ad-row" style={{ marginTop: 14 }}>
          <RImg src={c.badge.photoUrl} seed="badge-preview" style={{ width: 92, height: 112, objectFit: 'cover', borderRadius: 6, background: '#dfe4e1' }} />
          <label className="btn sm ghost" style={{ cursor: 'pointer' }}>
            {badgeUploading ? 'Uploading…' : c.badge.photoUrl ? 'Replace badge photo' : 'Upload badge photo'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadBadgePhoto(f)
                e.target.value = ''
              }}
            />
          </label>
          {c.badge.photoUrl && (
            <button className="btn sm ghost" onClick={() => set((x) => (x.badge.photoUrl = ''))}>
              Reset to studio cutout
            </button>
          )}
        </div>
        <div className="ad-grid2" style={{ marginTop: 14 }}>
          {c.badge.rows.map((r, i) => (
            <div key={i} className="ad-grid2" style={{ gap: 8 }}>
              <input
                className="inp"
                value={r.label}
                onChange={(e) =>
                  set((x) => {
                    x.badge.rows[i].label = e.target.value
                  })
                }
              />
              <input
                className="inp"
                value={r.value}
                onChange={(e) =>
                  set((x) => {
                    x.badge.rows[i].value = e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ad-card">
        <h3>Navigation & case labels</h3>
        <div className="ad-grid3">
          <Field label="Tag 1 (studio)">
            <input className="inp" value={c.nav.studio} onChange={(e) => set((x) => (x.nav.studio = e.target.value))} />
          </Field>
          <Field label="Tag 2 (portfolio)">
            <input className="inp" value={c.nav.portfolio} onChange={(e) => set((x) => (x.nav.portfolio = e.target.value))} />
          </Field>
          <Field label="Tag 3 (services)">
            <input className="inp" value={c.nav.services} onChange={(e) => set((x) => (x.nav.services = e.target.value))} />
          </Field>
          <Field label="Tag 4 (book)">
            <input className="inp" value={c.nav.book} onChange={(e) => set((x) => (x.nav.book = e.target.value))} />
          </Field>
          <Field label="Case logo text">
            <input className="inp" value={c.nav.caseLogo} onChange={(e) => set((x) => (x.nav.caseLogo = e.target.value))} />
          </Field>
          <Field label="Screen cue text">
            <input className="inp" value={c.ticket.screenCue} onChange={(e) => set((x) => (x.ticket.screenCue = e.target.value))} />
          </Field>
          <Field label="Ticket button">
            <input className="inp" value={c.ticket.viewFull} onChange={(e) => set((x) => (x.ticket.viewFull = e.target.value))} />
          </Field>
          <Field label="Browse all button">
            <input className="inp" value={c.ticket.browseAll} onChange={(e) => set((x) => (x.ticket.browseAll = e.target.value))} />
          </Field>
          <Field label="All projects heading">
            <input className="inp" value={c.ticket.allProjectsHeading} onChange={(e) => set((x) => (x.ticket.allProjectsHeading = e.target.value))} />
          </Field>
          <Field label="Previous label">
            <input className="inp" value={c.ticket.prevLabel} onChange={(e) => set((x) => (x.ticket.prevLabel = e.target.value))} />
          </Field>
          <Field label="Next label">
            <input className="inp" value={c.ticket.nextLabel} onChange={(e) => set((x) => (x.ticket.nextLabel = e.target.value))} />
          </Field>
        </div>
      </div>

      <div className="ad-card">
        <h3>Services manager</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.services.map((s, i) => (
            <div key={s.id} className="ad-row" style={{ alignItems: 'flex-end' }}>
              <Field label="Title">
                <input className="inp" value={s.title} onChange={(e) => set((x) => (x.services[i].title = e.target.value))} />
              </Field>
              <Field label="Tag">
                <input className="inp" value={s.tag} onChange={(e) => set((x) => (x.services[i].tag = e.target.value))} />
              </Field>
              <Field label="Description">
                <input className="inp" value={s.desc} onChange={(e) => set((x) => (x.services[i].desc = e.target.value))} />
              </Field>
              <div className="pi-actions">
                <button className="iconbtn" disabled={i === 0} onClick={() => set((x) => moveSvc(x.services, i, -1))}>
                  ↑
                </button>
                <button className="iconbtn" disabled={i === c.services.length - 1} onClick={() => set((x) => moveSvc(x.services, i, 1))}>
                  ↓
                </button>
                <button className="iconbtn danger" onClick={() => set((x) => x.services.splice(i, 1))}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn sm"
          style={{ marginTop: 14 }}
          onClick={() => set((x) => x.services.push({ id: uid(), title: 'New Service', tag: 'TAG', desc: 'Short description.' }))}
        >
          + Add Service
        </button>
      </div>
    </div>
  )
}

function moveSvc(arr: SiteContent['services'], i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const [x] = arr.splice(i, 1)
  arr.splice(j, 0, x)
}

function cloneContent(c: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(c))
}

/* ================================================================
   Settings
   ================================================================ */
function SettingsTab() {
  const { mode, reconnect, content, projects, saveContent, saveProject, toast, listInquiries } = useStore()
  const [url, setUrl] = useState(() => storedCreds()?.url ?? '')
  const [key, setKey] = useState(() => storedCreds()?.key ?? '')
  const [cur, setCur] = useState('')
  const [nw, setNw] = useState('')
  const [inq, setInq] = useState<Inquiry[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listInquiries().then(setInq)
  }, [listInquiries])

  async function connect() {
    if (!url.trim() || !key.trim()) {
      toast('Paste both the Supabase URL and anon key')
      return
    }
    saveCreds({ url: url.trim(), key: key.trim() })
    await reconnect()
    toast('Supabase connected · cloud sync active')
  }

  async function disconnect() {
    saveCreds(null)
    await reconnect()
    toast('Switched back to local preview mode')
  }

  function exportBackup() {
    const data = { exportedAt: new Date().toISOString(), projects, content }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ab-visuals-backup-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Backup downloaded')
  }

  async function importBackup(file: File) {
    try {
      const json = JSON.parse(await file.text())
      if (json.content) await saveContent(json.content)
      if (Array.isArray(json.projects)) {
        for (const p of json.projects) await saveProject(p)
      }
      toast('Backup imported')
    } catch {
      toast('Invalid backup file')
    }
  }

  return (
    <div>
      <div className="ad-card">
        <h3>Cloud mode</h3>
        <p style={{ marginTop: 0, fontSize: 13, color: 'rgba(215,232,222,.7)' }}>
          Current backend:{' '}
          <b style={{ color: mode === 'supabase' ? 'var(--mint)' : '#fff' }}>
            {mode === 'supabase' ? 'Supabase Cloud (all devices sync instantly)' : 'Local preview (IndexedDB + this browser)'}
          </b>
        </p>
        <div className="ad-grid2">
          <Field label="Supabase project URL">
            <input className="inp" placeholder="https://xxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} />
          </Field>
          <Field label="Publishable / anon API key">
            <input className="inp" placeholder="sb_publishable_… or eyJ…" value={key} onChange={(e) => setKey(e.target.value)} />
          </Field>
        </div>
        <div className="ad-row" style={{ marginTop: 14 }}>
          <button className="btn mint" onClick={connect}>
            Connect Supabase Cloud
          </button>
          {mode === 'supabase' && (
            <button className="btn ghost" onClick={disconnect}>
              Disconnect (use local)
            </button>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(215,232,222,.55)', marginBottom: 0 }}>
          Keys are stored in this browser and can also be set as VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY at deploy time.
          Run the SQL below once in the Supabase SQL editor to create tables, the public bucket and policies.
        </p>
      </div>

      <div className="ad-card">
        <h3>One-time setup SQL</h3>
        <div className="ad-row" style={{ marginBottom: 10 }}>
          <button
            className="btn sm"
            onClick={() => {
              navigator.clipboard?.writeText(SUPABASE_SQL)
              toast('SQL copied to clipboard')
            }}
          >
            Copy SQL
          </button>
        </div>
        <div className="sql">{SUPABASE_SQL}</div>
      </div>

      <div className="ad-card">
        <h3>Security — admin passcode</h3>
        <div className="ad-grid3">
          <Field label="Current passcode">
            <input className="inp" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
          </Field>
          <Field label="New passcode">
            <input className="inp" type="password" value={nw} onChange={(e) => setNw(e.target.value)} />
          </Field>
          <div className="f" style={{ justifyContent: 'flex-end' }}>
            <button
              className="btn sm"
              onClick={() => {
                if (!checkPw(cur)) {
                  toast('Current passcode is wrong')
                  return
                }
                if (nw.length < 4) {
                  toast('New passcode too short')
                  return
                }
                localStorage.setItem(PW_KEY, hash(nw))
                setCur('')
                setNw('')
                toast('Passcode updated')
              }}
            >
              Change passcode
            </button>
          </div>
        </div>
      </div>

      <div className="ad-card">
        <h3>Backup & restore</h3>
        <div className="ad-row">
          <button className="btn" onClick={exportBackup}>
            Export site backup (JSON)
          </button>
          <label className="btn ghost" style={{ cursor: 'pointer' }}>
            Import backup
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importBackup(f)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      <div className="ad-card">
        <h3>Shoot inquiries ({inq.length})</h3>
        {inq.length === 0 && <div style={{ fontSize: 13, color: 'rgba(215,232,222,.55)' }}>No inquiries yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inq.map((i) => (
            <div key={i.id} className="ad-row" style={{ justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: 8 }}>
              <div>
                <b style={{ fontSize: 13 }}>{i.name || '—'}</b>{' '}
                <span style={{ fontSize: 12, color: 'rgba(215,232,222,.65)' }}>
                  {i.type} · {i.date || 'flexible'} · {i.location || '—'}
                </span>
                <div style={{ fontSize: 12, color: 'rgba(215,232,222,.75)' }}>{i.message}</div>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(215,232,222,.45)', flex: 'none' }}>
                {i.created_at ? new Date(i.created_at).toLocaleString() : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
