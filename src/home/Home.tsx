import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore, waLink } from '../lib/store'
import { PLATE, CASE_PLATE, CUT, BADGE, TRANS } from '../lib/assets'
import { ytId, ytPreviewEmbed } from '../lib/youtube'
import { Project } from '../lib/types'
import { RImg } from './RImg'
import { ProjectModal, AllProjectsModal, ContactModal } from './Modals'

type ModalState = null | { t: 'project'; id: string } | { t: 'all' } | { t: 'contact'; tab: 'services' | 'inquiry' }

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const raf2 = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

const pad2 = (n: number) => String(n).padStart(2, '0')

/* ------------------------------------------------------------------ */
/*  Small media pieces                                                 */
/* ------------------------------------------------------------------ */

function KenBurns({ project }: { project: Project }) {
  const imgs = useMemo(() => {
    const list = project.gallery_images?.length
      ? project.gallery_images
      : [{ id: 'cover', url: project.cover_image_url, caption: '' }]
    return list.filter((i) => i && i.url)
  }, [project])
  const [i, setI] = useState(0)
  useEffect(() => {
    if (imgs.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % imgs.length), 3400)
    return () => clearInterval(t)
  }, [imgs.length])
  if (!imgs.length) return <div className="sp-empty" />
  return (
    <div className="kb">
      {imgs.map((im, j) => (
        <div key={im.id ?? j} className={'kb-slide' + (j === i ? ' on' : '')}>
          <RImg src={im.url} alt={im.caption || project.title} seed={'kb-' + j + '-' + project.id} />
        </div>
      ))}
      <div className="kb-play" aria-hidden>
        <svg viewBox="0 0 24 24" width="44" height="44">
          <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.85)" strokeWidth="1.4" />
          <path d="M10 8.5v7l6-3.5z" fill="#fff" />
        </svg>
      </div>
    </div>
  )
}

function ScreenPreview({ project, active }: { project: Project; active: boolean }) {
  const [videoOk, setVideoOk] = useState(true)
  const pv = project.preview_video_url
  useEffect(() => setVideoOk(true), [pv])
  if (pv && !pv.startsWith('local://') && videoOk) {
    return (
      <video
        className="sp-video"
        src={pv}
        muted
        loop
        playsInline
        autoPlay={active}
        onError={() => setVideoOk(false)}
      />
    )
  }
  const yt = (project.youtube_urls || []).map(ytId).find(Boolean)
  if (yt) {
    return (
      <iframe
        className="sp-iframe"
        src={ytPreviewEmbed(yt)}
        title={project.title}
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        tabIndex={-1}
      />
    )
  }
  return <KenBurns project={project} />
}

/* ------------------------------------------------------------------ */
/*  Social icons                                                       */
/* ------------------------------------------------------------------ */

export const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)
export const IconYouTube = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.5 12 5.5 12 5.5s-6 0-7.9.6A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.6 7.9.6 7.9.6s6 0 7.9-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.4 12 31 31 0 0 0 22 8.2zM10 15V9l5.2 3z" />
  </svg>
)
export const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.2-.2-.2-.5-.4z" />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  Home                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { ready, projects, content, toast } = useStore()
  const published = useMemo(() => projects.filter((p) => p.is_published), [projects])

  const [mode, setMode] = useState<'hero' | 'case'>('hero')
  const [busy, setBusy] = useState(false)
  const [index, setIndex] = useState(0)
  const [modal, setModal] = useState<ModalState>(null)
  const [entered, setEntered] = useState(false)
  const [caseIn, setCaseIn] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const [pulse, setPulse] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const plateRef = useRef<HTMLImageElement>(null)
  const cutRef = useRef<HTMLImageElement>(null)
  const transRef = useRef<HTMLVideoElement>(null)
  const caseRef = useRef<HTMLImageElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const wmRef = useRef<SVGSVGElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const badgeAnimRef = useRef<HTMLDivElement>(null)
  const swayRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLDivElement>(null)
  const uiRef = useRef<HTMLDivElement>(null)
  const transErr = useRef(false)

  const S = useRef({ mode, busy, modal, index, publishedLen: published.length })
  S.current = { mode, busy, modal, index, publishedLen: published.length }

  const project = published[Math.min(index, published.length - 1)]

  /* ---------------- geometry ---------------- */
  const computePose = useCallback((which: 'hero' | 'case') => {
    const W = window.innerWidth
    const H = window.innerHeight
    if (W > 820) {
      const cover = Math.max(W / 1440, H / 810)
      const u = Math.min(W / 1440, H / 900)
      if (which === 'hero') return { s: cover, x: (W - 1440 * cover) / 2, y: 0, u }
      const top = 66 * u
      const fitH = (H - top - 38 * u) / (762 - 79)
      let s: number, y: number
      if (fitH >= cover) {
        s = cover
        y = Math.min(0, Math.max(H - 810 * s, top - 79 * s))
      } else {
        s = fitH
        y = top - 79 * fitH
      }
      return { s, x: (W - 1440 * s) / 2, y, u }
    }
    // mobile / tablet
    const s = Math.min(W / 640, H / 900)
    if (which === 'hero') {
      const x = W / 2 - 760 * s
      const y = (H - 810 * s) * 0.45
      return { s, x, y, u: W / 430 }
    }
    const sc = Math.min((W * 0.94) / 894.4, (H * 0.52) / 604.7)
    const cx = W / 2 - (272.8 + 894.4 / 2) * sc
    const cy = Math.max(H * 0.42 - 102.7 * sc, H * 0.08)
    return { s: sc, x: cx, y: cy, u: W / 430 }
  }, [])

  const fitHero = useCallback(
    (pose: { s: number; x: number; y: number }) => {
      const W = window.innerWidth
      const H = window.innerHeight
      const { s, x, y } = pose
      const vl = Math.max(0, -x / s)
      const vr = Math.min(1440, (W - x) / s)
      const pad = 18 / s
      const wm = wmRef.current
      if (wm) {
        if (W > 820) {
          wm.style.left = vl + 0.6 * pad + 'px'
          wm.style.width = Math.max(300, vr - vl - 1.2 * pad) + 'px'
        } else {
          wm.style.left = 720 - W / 2 / s + 'px'
          wm.style.width = '1440px'
        }
      }
      const bd = badgeRef.current
      if (bd) {
        if (W > 820) {
          const vb = Math.min(810, (H - y) / s)
          bd.style.left = Math.min(986, vr - pad - 417) + 'px'
          bd.style.top = Math.min(-165, vb - 68 / s - 935) + 'px'
          bd.style.transform = 'scale(1)'
        } else {
          const k = Math.min(0.3, (W * 0.26) / 582)
          bd.style.left = vr - pad - 582 * k + 'px'
          bd.style.top = (10 - y) / s + 'px'
          bd.style.transform = `scale(${k})`
        }
      }
      const sc = scriptRef.current
      if (sc) {
        if (W > 820) {
          sc.style.left = vl + pad + 60 + 'px'
        } else {
          sc.style.left = (14 - x) / s + 'px'
          sc.style.top = (118 - y) / s + 'px'
        }
      }
    },
    [],
  )

  const place = useCallback(
    (which: 'hero' | 'case') => {
      const frame = frameRef.current
      if (!frame) return
      const pose = computePose(which)
      frame.style.transform = `translate(${pose.x}px, ${pose.y}px) scale(${pose.s})`
      const ui = uiRef.current
      if (ui) ui.style.setProperty('--n', String(pose.u))
      if (which === 'hero') fitHero(pose)
    },
    [computePose, fitHero],
  )

  useEffect(() => {
    const onResize = () => place(S.current.mode)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [place])

  useEffect(() => {
    if (ready) place('hero')
  }, [ready, place])

  /* ---------------- entrance ---------------- */
  useEffect(() => {
    if (!ready) return
    let alive = true
    const go = () => {
      if (!alive) return
      setEntered(true)
      rootRef.current?.classList.add('in')
    }
    let timer = 0
    const start = async () => {
      const plate = plateRef.current
      try {
        await Promise.race([
          Promise.all([
            (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve(),
            plate
              ? plate.complete
                ? Promise.resolve()
                : new Promise((r) => {
                    plate.onload = () => r(null)
                    plate.onerror = () => r(null)
                  })
              : Promise.resolve(),
          ]),
          wait(2500),
        ])
      } catch {
        /* ignore */
      }
      timer = window.setTimeout(go, 120)
    }
    const kick = window.setTimeout(start, 80)
    const failsafe = window.setTimeout(go, 4000)
    return () => {
      alive = false
      clearTimeout(kick)
      clearTimeout(failsafe)
      if (timer) clearTimeout(timer)
    }
  }, [ready])

  /* ---------------- transitions ---------------- */
  const arriveCase = useCallback(() => {
    setCaseIn(true)
    setBusy(false)
    S.current.busy = false
  }, [])

  const toCase = useCallback(async () => {
    const st = S.current
    if (st.busy || st.mode !== 'hero') return
    st.busy = true
    setBusy(true)
    rootRef.current?.classList.add('leaving')
    await wait(330)
    if (!S.current.busy) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const trans = transRef.current
    const usable = !!trans && !transErr.current && trans.readyState >= 2
    S.current.mode = 'case'
    setMode('case')
    if (reduced || !usable) {
      place('case')
      if (caseRef.current) caseRef.current.style.opacity = '1'
      if (plateRef.current) plateRef.current.style.visibility = 'hidden'
      if (cutRef.current) cutRef.current.style.opacity = '0'
      await wait(500)
      arriveCase()
      return
    }
    if (trans) {
      trans.style.opacity = '1'
      await raf2()
      if (plateRef.current) plateRef.current.style.visibility = 'hidden'
      if (cutRef.current) cutRef.current.style.opacity = '0'
      const frame = frameRef.current
      if (frame) {
        frame.style.setProperty('--glide', '1.6s')
        frame.classList.add('glide')
      }
      place('case')
      const dur = trans.duration || 5.04
      trans.currentTime = 0
      try {
        await trans.play()
      } catch {
        /* autoplay */
      }
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        trans.removeEventListener('ended', finish)
        if (caseRef.current) caseRef.current.style.opacity = '1'
        trans.style.opacity = '0'
        trans.pause()
        frame?.classList.remove('glide')
        arriveCase()
      }
      trans.addEventListener('ended', finish)
      const tick = () => {
        if (finished) return
        const p = trans.currentTime / dur
        trans.playbackRate = Math.max(1.2, 1.8 + 2.4 * Math.sin(Math.PI * Math.min(p * 1.08, 1)))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      setTimeout(finish, 4600)
    }
  }, [place, arriveCase])

  const replayHeroEntrance = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    root.classList.remove('in')
    void root.offsetWidth
    root.classList.add('in')
  }, [])

  const toHero = useCallback(async () => {
    const st = S.current
    if (st.busy || st.mode !== 'case' || st.modal) return
    st.busy = true
    setBusy(true)
    setCaseIn(false)
    rootRef.current?.classList.remove('leaving')
    const frame = frameRef.current
    if (frame) {
      frame.style.setProperty('--glide', '1.35s')
      frame.classList.add('glide')
    }
    place('hero')
    S.current.mode = 'hero'
    setMode('hero')
    if (caseRef.current) caseRef.current.style.opacity = '0'
    if (transRef.current) {
      transRef.current.style.opacity = '0'
      transRef.current.pause()
    }
    await wait(160)
    if (plateRef.current) {
      plateRef.current.style.visibility = 'visible'
      plateRef.current.style.opacity = '1'
    }
    if (cutRef.current) cutRef.current.style.opacity = '1'
    await wait(700)
    frame?.classList.remove('glide')
    replayHeroEntrance()
    setBusy(false)
    S.current.busy = false
  }, [place, replayHeroEntrance])

  const switchCase = useCallback(
    (dir: -1 | 1) => {
      const st = S.current
      if (st.busy || st.mode !== 'case') return
      const len = st.publishedLen
      if (len < 2) return
      const next = (st.index + dir + len) % len
      setFlashKey((k) => k + 1)
      setIndex(next)
      S.current.index = next
    },
    [],
  )

  const openProject = useCallback((id: string) => {
    const i = published.findIndex((p) => p.id === id)
    if (i >= 0) {
      setIndex(i)
      S.current.index = i
    }
    setModal({ t: 'project', id })
  }, [published])

  /* ---------------- input ---------------- */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const st = S.current
      if (st.modal || st.busy) return
      if (st.mode === 'hero' && e.deltaY >= 18) toCase()
      else if (st.mode === 'case' && e.deltaY <= -18) toHero()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [toCase, toHero])

  useEffect(() => {
    let sx = 0,
      sy = 0,
      on = false
    const ts = (e: TouchEvent) => {
      const t = e.touches[0]
      sx = t.clientX
      sy = t.clientY
      on = true
    }
    const te = (e: TouchEvent) => {
      if (!on) return
      on = false
      const st = S.current
      if (st.modal || st.busy) return
      const t = e.changedTouches[0]
      const dx = t.clientX - sx
      const dy = t.clientY - sy
      if (st.mode === 'hero' && dy <= -40 && Math.abs(dy) > Math.abs(dx)) toCase()
      else if (st.mode === 'case') {
        if (dy >= 40 && Math.abs(dy) > Math.abs(dx)) toHero()
        else if (Math.abs(dx) >= 60) switchCase(dx < 0 ? 1 : -1)
      }
    }
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    return () => {
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchend', te)
    }
  }, [toCase, toHero, switchCase])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = S.current
      if (st.modal || st.busy) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (st.mode === 'hero') {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault()
          toCase()
        }
      } else {
        if (e.key === 'ArrowUp' || e.key === 'PageDown') toHero()
        else if (e.key === 'Escape') toHero()
        else if (e.key === 'ArrowLeft') switchCase(-1)
        else if (e.key === 'ArrowRight') switchCase(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toCase, toHero, switchCase])

  /* body scroll lock while on the stage */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  /* ---------------- render ---------------- */
  if (!ready) {
    return (
      <div className="boot">
        <div className="boot-logo">AB VISUALS</div>
        <div className="boot-bar"><i /></div>
      </div>
    )
  }

  const badgePhoto = content.badge.photoUrl
  const socials = content.socials
  const wa = waLink(content)

  return (
    <div className={'home' + (entered ? ' in' : '') + (mode === 'case' ? ' mode-case' : '')} ref={rootRef}>
      <div className="stage">
        <div className="frame" ref={frameRef}>
          <img className="plate" ref={plateRef} src={PLATE} alt="AB VISUALS studio" draggable={false} />
          <svg className="wm" ref={wmRef} viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="wmg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#f1f5f3" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d7e6de" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <text x="18" y="212" textLength="1404" lengthAdjust="spacingAndGlyphs" fill="url(#wmg)">
              {content.hero.wordmark || 'AB VISUALS'}
            </text>
          </svg>
          <img className="cut" ref={cutRef} src={CUT} alt="" draggable={false} />
          <div className="badge" ref={badgeRef}>
            <div className="badge-anim" ref={badgeAnimRef}>
              <div
                className="badge-sway"
                ref={swayRef}
                onPointerEnter={(e) => {
                  if (S.current.mode !== 'hero') return
                  const el = e.currentTarget
                  el.classList.remove('swing')
                  void el.offsetWidth
                  el.classList.add('swing')
                }}
                onAnimationEnd={(e) => {
                  if (e.animationName === 'swing') e.currentTarget.classList.remove('swing')
                }}
              >
                <img src={BADGE} alt="Lanyard ID badge" draggable={false} />
                <div className="card">
                  <h4>{content.badge.heading}</h4>
                  <span className="yr">{content.badge.year}</span>
                  <div className="role">{content.badge.role}</div>
                  <div
                    className="ph"
                    style={
                      badgePhoto
                        ? { backgroundImage: `url(${badgePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { backgroundImage: `url(${CUT})` }
                    }
                  />
                  {content.badge.rows.map((r, i) => (
                    <div className="row" key={i}>
                      <span>{r.label}</span>
                      <b>{r.value}</b>
                    </div>
                  ))}
                </div>
                <div className="hit" />
              </div>
            </div>
          </div>
          <div className="script" ref={scriptRef}>
            {content.hero.script}
          </div>
          <video
            className="trans"
            ref={transRef}
            src={TRANS}
            muted
            playsInline
            preload="auto"
            onError={() => (transErr.current = true)}
          />
          <img className="caseplate" ref={caseRef} src={CASE_PLATE} alt="" draggable={false} />
          <div className={'screen' + (caseIn ? ' on' : '')} ref={screenRef}>
            {caseIn && project && <ScreenPreview project={project} active={caseIn} />}
            <div key={flashKey} className="flash" />
            <div className="cue">
              {content.ticket.screenCue}
              {project ? ` • ${project.gallery_images.length} Photos${project.youtube_urls.length ? ' • Video' : ''}` : ''}
            </div>
          </div>
          <div
            className={'screen-hit' + (caseIn ? ' on' : '')}
            onClick={() => {
              if (project) openProject(project.id)
            }}
          />
        </div>
      </div>

      <div className="ui" ref={uiRef}>
        <button
          className={'tag t1' + (pulse ? ' pulse' : '')}
          key={'t1' + pulse}
          onClick={() => {
            if (mode === 'case') toHero()
            else setPulse((p) => p + 1)
          }}
        >
          {content.nav.studio}
        </button>
        <button className="tag t2" onClick={() => (mode === 'hero' ? toCase() : setModal({ t: 'all' }))}>
          {content.nav.portfolio}
        </button>
        <button className="tag t3" onClick={() => setModal({ t: 'contact', tab: 'services' })}>
          {content.nav.services}
        </button>
        <button className="tag t4" onClick={() => setModal({ t: 'contact', tab: 'inquiry' })}>
          {content.nav.book}
        </button>
        <button className={'logo' + (caseIn ? ' on' : '')} onClick={() => mode === 'case' && toHero()}>
          {content.nav.caseLogo}
        </button>

        <div className="bottomwrap">
          <div className="socialbar">
            {socials.instagramShow && (
              <a href={socials.instagramUrl} target="_blank" rel="noopener noreferrer">
                <IconInstagram />
                <span>{socials.instagramLabel || 'Instagram'}</span>
              </a>
            )}
            {socials.youtubeShow && (
              <a href={socials.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <IconYouTube />
                <span>{socials.youtubeLabel || 'YouTube'}</span>
              </a>
            )}
            {socials.whatsappShow && (
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp />
                <span>{socials.whatsappLabel || 'WhatsApp'}</span>
              </a>
            )}
          </div>
          <div className="hint">
            {content.hero.scrollHint}
            <div className="line">
              <i className="bead" />
            </div>
          </div>
        </div>

        <div className={'case-ui' + (caseIn ? ' on' : '')}>
          {project && (
            <>
              <div className="ticket">
                <i className="hole h1" />
                <i className="hole h2" />
                <i className="hole h3" />
                <i className="hole h4" />
                <div className="ticket-body" key={project.id}>
                  <div className="tcat">{project.category}</div>
                  <h2>{project.title}</h2>
                  <div className="rows">
                    {(project.ticket_rows?.length ? project.ticket_rows : ['', '', '']).slice(0, 3).map((r, i) => (
                      <div key={i}>{r}</div>
                    ))}
                  </div>
                  <button className="viewfull" onClick={() => openProject(project.id)}>
                    {content.ticket.viewFull}
                  </button>
                </div>
              </div>
              <div className="desc">
                <div className="dchild">
                  <span className="pill">{project.category}</span>
                </div>
                <div className="dchild k">{project.short_key}</div>
                <div className="dchild p">{project.short_desc}</div>
                <div className="dchild num">
                  {pad2(index + 1)} / {pad2(Math.max(published.length, 1))}
                </div>
                <div className="dchild">
                  <button className="browse" onClick={() => setModal({ t: 'all' })}>
                    {content.ticket.browseAll}
                  </button>
                </div>
              </div>
              <button className="pn prev" onClick={() => switchCase(-1)} disabled={published.length < 2}>
                <span className="c">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </span>
                <span className="lbl">{content.ticket.prevLabel}</span>
              </button>
              <button className="pn next" onClick={() => switchCase(1)} disabled={published.length < 2}>
                <span className="c">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span className="lbl">{content.ticket.nextLabel}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {modal?.t === 'project' && (
        <ProjectModal
          projectId={modal.id}
          onClose={() => setModal(null)}
          onOpenProject={openProject}
          onBrowseAll={() => setModal({ t: 'all' })}
        />
      )}
      {modal?.t === 'all' && <AllProjectsModal onClose={() => setModal(null)} onOpen={openProject} />}
      {modal?.t === 'contact' && <ContactModal initialTab={modal.tab} onClose={() => setModal(null)} />}
    </div>
  )
}
