import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore, waLink } from '../lib/store'
import { ytId, ytCinemaEmbed } from '../lib/youtube'
import { Project } from '../lib/types'
import { RImg } from './RImg'
import { IconInstagram, IconYouTube, IconWhatsApp } from './Home'

/* ------------------------------------------------------------------ */
/*  Lightbox                                                           */
/* ------------------------------------------------------------------ */

function Lightbox({
  project,
  index,
  onNav,
  onClose,
}: {
  project: Project
  index: number
  onNav: (i: number) => void
  onClose: () => void
}) {
  const imgs = project.gallery_images
  const [zoom, setZoom] = useState(false)
  const sx = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNav((index + 1) % imgs.length)
      else if (e.key === 'ArrowLeft') onNav((index - 1 + imgs.length) % imgs.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, imgs.length, onNav, onClose])

  const img = imgs[index]
  return (
    <div
      className="lightbox"
      onTouchStart={(e) => (sx.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - sx.current
        if (Math.abs(dx) > 48) onNav((index + (dx < 0 ? 1 : -1) + imgs.length) % imgs.length)
      }}
    >
      <button className="lb-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <button
        className="lb-arrow left"
        onClick={() => onNav((index - 1 + imgs.length) % imgs.length)}
        aria-label="Previous"
      >
        ‹
      </button>
      <div className={'lb-stage' + (zoom ? ' zoom' : '')}>
        <RImg
          src={img?.url}
          alt={img?.caption || project.title}
          seed={'lb-' + index + '-' + project.id}
          onClick={() => setZoom((z) => !z)}
          style={{ cursor: zoom ? 'zoom-out' : 'zoom-in' }}
        />
      </div>
      <button
        className="lb-arrow right"
        onClick={() => onNav((index + 1) % imgs.length)}
        aria-label="Next"
      >
        ›
      </button>
      <div className="lb-counter">
        {index + 1} / {imgs.length}
        {img?.caption ? <span className="lb-cap"> · {img.caption}</span> : null}
      </div>
      <div className="lb-thumbs">
        {imgs.map((im, i) => (
          <button key={im.id ?? i} className={i === index ? 'on' : ''} onClick={() => onNav(i)}>
            <RImg src={im.url} alt={im.caption || ''} seed={'th-' + i + '-' + project.id} />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Project big-screen showcase                                        */
/* ------------------------------------------------------------------ */

export function ProjectModal({
  projectId,
  onClose,
  onOpenProject,
  onBrowseAll,
}: {
  projectId: string
  onClose: () => void
  onOpenProject: (id: string) => void
  onBrowseAll: () => void
}) {
  const { projects, content } = useStore()
  const project = projects.find((p) => p.id === projectId)
  const [vIdx, setVIdx] = useState(0)
  const [lb, setLb] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lb === null) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, lb])

  useEffect(() => setVIdx(0), [projectId])

  const yts = useMemo(
    () => (project?.youtube_urls || []).map((u) => ({ url: u, id: ytId(u) })).filter((x) => x.id),
    [project],
  )
  const mp4 = project?.preview_video_url && !project.preview_video_url.startsWith('local://') ? project.preview_video_url : null
  const next = useMemo(() => {
    const pub = projects.filter((p) => p.is_published)
    const i = pub.findIndex((p) => p.id === projectId)
    return pub[(i + 1) % pub.length]
  }, [projects, projectId])

  if (!project) return null
  const enquire = `Hi AB VISUALS, I loved your project '${project.title}' and want to discuss a shoot!`

  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="crumb">
            <span className="pill">{project.category}</span>
            <span className="crumb-title">{project.title}</span>
          </div>
          <div className="head-meta">
            <span>{project.location}</span>
            <span>{project.year}</span>
            <span>{project.gallery_images.length} Photos</span>
            <span>{yts.length + (mp4 ? 1 : 0)} Video{(yts.length + (mp4 ? 1 : 0)) === 1 ? '' : 's'}</span>
            <a className="btn-wa" href={waLink(content, enquire)} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp /> Enquire on WhatsApp
            </a>
            <button className="btn-close" onClick={onClose}>
              Close ✕
            </button>
          </div>
        </div>

        <div className="sheet-body">
          {(yts.length > 0 || mp4) && (
            <div className="cinema">
              {yts.length > 0 ? (
                <div className="cinema-main">
                  <iframe
                    key={yts[Math.min(vIdx, yts.length - 1)].id}
                    src={ytCinemaEmbed(yts[Math.min(vIdx, yts.length - 1)].id!)}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="cinema-main">
                  <video src={mp4!} controls playsInline autoPlay />
                </div>
              )}
              {yts.length > 1 && (
                <div className="episodes">
                  {yts.map((v, i) => (
                    <button key={v.id} className={i === Math.min(vIdx, yts.length - 1) ? 'on' : ''} onClick={() => setVIdx(i)}>
                      <img src={`https://i.ytimg.com/vi/${v.id}/default.jpg`} alt="" />
                      <span>Video {i + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="story">
            <h3>{project.short_key || project.title}</h3>
            <p>{project.full_description || project.short_desc}</p>
            <div className="tags">
              <span className="tagchip">{project.category}</span>
              <span className="tagchip">{project.location}</span>
              <span className="tagchip">{project.year}</span>
              {project.ticket_rows?.map((r, i) => (
                <span className="tagchip ghost" key={i}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          {project.gallery_images.length > 0 && (
            <div className="gallery">
              <h3 className="gal-title">Photos · {project.gallery_images.length}</h3>
              <div className="gal-grid">
                {project.gallery_images.map((im, i) => (
                  <button key={im.id ?? i} className="gal-item" onClick={() => setLb(i)}>
                    <RImg
                      src={im.url}
                      alt={im.caption || project.title}
                      seed={'g-' + i + '-' + project.id}
                      style={im.width && im.height ? { aspectRatio: `${im.width} / ${im.height}` } : { aspectRatio: '4 / 3' }}
                    />
                    {im.caption ? <span className="gal-cap">{im.caption}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {next && (
            <button className="nextproj" onClick={() => onOpenProject(next.id)}>
              <span>Next Project</span>
              <b>→ {next.title}</b>
            </button>
          )}
          <div className="sheet-foot">
            <button className="ghostbtn" onClick={onBrowseAll}>
              Browse All Projects ⇝
            </button>
            <div className="foot-social">
              <a href={content.socials.instagramUrl} target="_blank" rel="noopener noreferrer">
                <IconInstagram /> {content.socials.instagramLabel}
              </a>
              <a href={content.socials.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <IconYouTube /> {content.socials.youtubeLabel}
              </a>
              <a href={waLink(content, enquire)} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp /> {content.socials.whatsappLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
      {lb !== null && project.gallery_images.length > 0 && (
        <Lightbox project={project} index={lb} onNav={setLb} onClose={() => setLb(null)} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  All projects grid                                                  */
/* ------------------------------------------------------------------ */

export function AllProjectsModal({
  onClose,
  onOpen,
}: {
  onClose: () => void
  onOpen: (id: string) => void
}) {
  const { projects, content } = useStore()
  const [filter, setFilter] = useState('All')
  const cats = useMemo(() => ['All', ...new Set(content.services.map((s) => s.title))], [content.services])
  const pub = projects.filter((p) => p.is_published)
  const list = filter === 'All' ? pub : pub.filter((p) => p.category === filter)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet wide" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="crumb">
            <span className="crumb-title">{content.ticket.allProjectsHeading}</span>
          </div>
          <div className="head-meta">
            <span>{pub.length} Projects</span>
            <button className="btn-close" onClick={onClose}>
              Close ✕
            </button>
          </div>
        </div>
        <div className="sheet-body">
          <div className="filters">
            {cats.map((c) => (
              <button key={c} className={c === filter ? 'on' : ''} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="proj-grid">
            {list.map((p, i) => (
              <button className="proj-card" key={p.id} onClick={() => onOpen(p.id)}>
                <div className="pc-cover">
                  <RImg src={p.cover_image_url} alt={p.title} seed={'pc-' + i + '-' + p.id} />
                  {p.youtube_urls.length > 0 || p.preview_video_url ? <span className="pc-vid">▶ VIDEO</span> : null}
                </div>
                <div className="pc-meta">
                  <b>{p.title}</b>
                  <span>
                    {p.category} · {p.gallery_images.length} photos
                  </span>
                  <span className="pc-idx">{String(i + 1).padStart(2, '0')}</span>
                </div>
              </button>
            ))}
            {list.length === 0 && <div className="empty">No projects in this category yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Services & contact drawer                                          */
/* ------------------------------------------------------------------ */

export function ContactModal({
  initialTab,
  onClose,
}: {
  initialTab: 'services' | 'inquiry'
  onClose: () => void
}) {
  const { content, saveInquiry } = useStore()
  const [tab, setTab] = useState(initialTab)
  const [form, setForm] = useState({ name: '', type: 'Wedding', date: '', location: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => setTab(initialTab), [initialTab])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `Hi AB VISUALS! I want to book a shoot.\n\nName: ${form.name}\nType: ${form.type}\nDate: ${form.date || 'flexible'}\nLocation: ${form.location || 'to be decided'}\n\n${form.message}`
    saveInquiry({ name: form.name, type: form.type, date: form.date, location: form.location, message: form.message })
    window.open(waLink(content, msg), '_blank', 'noopener')
    setSent(true)
    setTimeout(() => setSent(false), 3500)
  }

  const c = content.contact
  const shootTypes = ['Wedding', 'Pre-Wedding', 'Concert/Event', 'Real Estate', 'Commercial', 'Drone Rental/Pilot']

  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet contact" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="crumb">
            <span className="crumb-title">{content.drawer.heading}</span>
          </div>
          <div className="head-meta">
            <button className="btn-close" onClick={onClose}>
              Close ✕
            </button>
          </div>
        </div>
        <div className="sheet-body">
          <p className="drawer-sub">{content.drawer.subheading}</p>
          <div className="ctabs">
            <button className={tab === 'services' ? 'on' : ''} onClick={() => setTab('services')}>
              Services
            </button>
            <button className={tab === 'inquiry' ? 'on' : ''} onClick={() => setTab('inquiry')}>
              Shoot Inquiry
            </button>
          </div>

          {tab === 'services' && (
            <>
              <div className="svc-grid">
                {content.services.map((s) => (
                  <div className="svc" key={s.id}>
                    <span className="svc-tag">{s.tag}</span>
                    <b>{s.title}</b>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="contact-cards">
                <a className="cc" href={`tel:${c.phone.replace(/\s/g, '')}`}>
                  <span>Phone</span>
                  <b>{c.phone}</b>
                </a>
                <a className="cc" href={`mailto:${c.email}`}>
                  <span>Email</span>
                  <b>{c.email}</b>
                </a>
                <div className="cc">
                  <span>Studio</span>
                  <b>{c.city}</b>
                  <small>{c.availability}</small>
                </div>
                <div className="cc socials">
                  <a href={content.socials.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <IconInstagram /> {content.socials.instagramLabel}
                  </a>
                  <a href={content.socials.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <IconYouTube /> {content.socials.youtubeLabel}
                  </a>
                  <a href={waLink(content)} target="_blank" rel="noopener noreferrer">
                    <IconWhatsApp /> {content.socials.whatsappLabel}
                  </a>
                </div>
              </div>
            </>
          )}

          {tab === 'inquiry' && (
            <form className="inq" onSubmit={submit}>
              <div className="inq-row">
                <label>
                  Name
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </label>
                <label>
                  Event / Shoot Type
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {shootTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="inq-row">
                <label>
                  Shoot Date
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </label>
                <label>
                  Location
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / Venue" />
                </label>
              </div>
              <label>
                Message
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your shoot…" />
              </label>
              <button className="btn-wa big" type="submit">
                <IconWhatsApp /> {sent ? 'Opening WhatsApp…' : content.drawer.ctaText}
              </button>
              <small className="inq-note">Opens WhatsApp with your inquiry pre-filled. Your lead is also saved to the AB VISUALS dashboard.</small>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
