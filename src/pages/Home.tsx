import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import AllProjects from '../components/AllProjects';
import BookingModal from '../components/BookingModal';
import ContactDrawer from '../components/ContactDrawer';
import { ArrowLeft, ArrowRight, GridIcon, PlayIcon } from '../components/Icons';
import Showcase from '../components/Showcase';
import SocialBar from '../components/SocialBar';
import { ASSETS } from '../lib/defaults';
import { useData } from '../lib/DataContext';
import { imgFallback, pad2, resolveBadgeValue } from '../lib/format';
import type { Project, SiteContent } from '../lib/types';
import { parseYouTubeId, youtubePreviewUrl } from '../lib/youtube';

type ModalState = { type: 'project'; id: string } | { type: 'all' } | { type: 'contact' } | { type: 'book' } | null;
type Mode = 'hero' | 'case';

const tagStyle = (i: number) => ({ '--i': i } as CSSProperties);

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const twoFrames = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/* --------------------------------------------------------------- preview */

function ScreenPreview({ project }: { project: Project }) {
  const [broken, setBroken] = useState(false);
  const [slide, setSlide] = useState(0);

  const ytId = useMemo(
    () => (project.youtube_urls || []).map((u) => parseYouTubeId(u)).find(Boolean) || null,
    [project.youtube_urls]
  );
  const slides = useMemo(
    () => [project.cover_image_url, ...(project.gallery_images || []).slice(0, 5).map((g) => g.url)].filter(Boolean),
    [project.cover_image_url, project.gallery_images]
  );

  useEffect(() => {
    setBroken(false);
    setSlide(0);
  }, [project.id]);

  const showVideo = Boolean(project.preview_video_url) && !broken;
  const showYt = !showVideo && Boolean(ytId) && !broken;

  useEffect(() => {
    if (showVideo || showYt || slides.length < 2) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % slides.length), 4200);
    return () => window.clearInterval(t);
  }, [showVideo, showYt, slides.length, project.id]);

  if (showVideo) {
    return (
      <video
        key={`${project.id}-video`}
        className="screen-media"
        src={project.preview_video_url || undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onError={() => setBroken(true)}
      />
    );
  }

  if (showYt && ytId) {
    return (
      <iframe
        key={`${project.id}-yt`}
        className="screen-media"
        src={youtubePreviewUrl(ytId)}
        title={`${project.title} preview`}
        allow="autoplay; encrypted-media; picture-in-picture"
        style={{ border: 0, pointerEvents: 'none' }}
        tabIndex={-1}
      />
    );
  }

  const src = slides[slide] || project.cover_image_url;
  return src ? (
    <img key={`${project.id}-img-${slide}`} className="screen-media screen-img" src={src} alt={`${project.title} preview`} onError={imgFallback} />
  ) : (
    <div className="screen-media" />
  );
}

/* ------------------------------------------------------------------ home */

export default function Home() {
  const { publicProjects: projects, content: cms } = useData();

  const [mode, setMode] = useState<Mode>('hero');
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [heroOut, setHeroOut] = useState(false);
  const [caseUi, setCaseUi] = useState(false);
  const [badgeSway, setBadgeSway] = useState(false);
  const [badgeCycle, setBadgeCycle] = useState(0);
  const [swinging, setSwinging] = useState(false);
  const [flash, setFlash] = useState(false);
  const [ticketRock, setTicketRock] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const modeRef = useRef<Mode>('hero');
  const busyRef = useRef(false);
  const transFailed = useRef(false);
  const metrics = useRef({ x: 0, y: 0, s: 1, W: 1440, H: 810 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLImageElement>(null);
  const cutRef = useRef<HTMLImageElement>(null);
  const caseplateRef = useRef<HTMLImageElement>(null);
  const transRef = useRef<HTMLVideoElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const wmRef = useRef<SVGSVGElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);

  const activeProject: Project | undefined = projects[index] || projects[0];
  const activeId = activeProject?.id;

  useEffect(() => {
    if (index > projects.length - 1) setIndex(Math.max(0, projects.length - 1));
  }, [projects.length, index]);

  /* ----------------------------------------------------------- geometry */

  const fitHero = useCallback((isHero: boolean) => {
    const { x, y, s, W, H } = metrics.current;
    if (!isHero) return;

    if (W > 820) {
      const vl = Math.max(0, -x / s);
      const vr = Math.min(1440, (W - x) / s);
      const pad = 18 / s;
      if (wmRef.current) {
        wmRef.current.style.left = `${vl + 0.6 * pad}px`;
        wmRef.current.style.width = `${Math.max(200, vr - vl - 1.2 * pad)}px`;
      }
      if (badgeRef.current) {
        badgeRef.current.style.left = `${Math.min(986, vr - pad - 417)}px`;
        const vb = Math.min(810, (H - y) / s);
        badgeRef.current.style.top = `${Math.min(-165, vb - 68 / s - 935)}px`;
      }
      if (scriptRef.current) scriptRef.current.style.left = `${vl + pad + 60}px`;
    } else {
      const vl = Math.max(0, -x / s);
      const vr = Math.min(1440, (W - x) / s);
      const pad = 12 / s;
      if (wmRef.current) {
        wmRef.current.style.left = `${vl + 0.5 * pad}px`;
        wmRef.current.style.width = `${Math.max(200, vr - vl - pad)}px`;
      }
      if (scriptRef.current) scriptRef.current.style.left = `${vl + pad + 6}px`;
      if (badgeRef.current) badgeRef.current.style.left = `${Math.min(986, vr - pad - 417)}px`;
    }

    const applyMask = (el: HTMLElement | null, top: number, h: number) => {
      if (!el) return;
      const overTop = Math.max(0, -(y + top * s));
      const overBottom = Math.max(0, y + (top + h) * s - H);
      el.style.setProperty('--mt', `${Math.min(14, (overTop / (h * s)) * 100)}%`);
      el.style.setProperty('--mb', `${Math.min(14, (overBottom / (h * s)) * 100)}%`);
    };
    applyMask(plateRef.current, -73.125, 956.25);
    applyMask(caseplateRef.current, -105.47, 956.25);
  }, []);

  const pose = useCallback(
    (m: Mode) => {
      const frame = frameRef.current;
      if (!frame) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      let s = 1;
      let x = 0;
      let y = 0;

      if (W > 820) {
        const cover = Math.max(W / 1440, H / 810);
        const u = Math.min(W / 1440, H / 900);
        if (m === 'hero') {
          s = cover;
          x = (W - 1440 * s) / 2;
          y = 0;
        } else {
          const top = 66 * u;
          const fit = (H - top - 38 * u) / (762 - 79);
          if (fit >= cover) {
            s = cover;
            y = Math.min(0, Math.max(H - 810 * s, top - 79 * s));
          } else {
            s = fit;
            y = top - 79 * fit;
          }
          x = (W - 1440 * s) / 2;
        }
      } else if (m === 'hero') {
        s = Math.min(W / 650, (0.62 * H) / 810);
        x = W / 2 - 805 * s;
        y = H - 790 * s;
      } else {
        s = Math.min((W - 16) / 894.4, (H * 0.5) / 604.7);
        x = W / 2 - 720 * s;
        y = Math.max(112, H * 0.36) - 102.7 * s;
      }

      metrics.current = { x, y, s, W, H };
      frame.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      fitHero(m === 'hero');
    },
    [fitHero]
  );

  const applyViewportUnits = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const n = W > 820 ? Math.min(W / 1440, H / 900) : W / 430;
    document.documentElement.style.setProperty('--n', `${n}px`);
  }, []);

  /* ------------------------------------------------------- initial mount */

  useEffect(() => {
    document.body.classList.remove('admin-mode');
    applyViewportUnits();
    pose('hero');
    window.history.replaceState({}, '', '/');
    const onResize = () => {
      applyViewportUnits();
      pose(modeRef.current);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [applyViewportUnits, pose]);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      setHeroIn(true);
      setBadgeSway(true);
    };
    const timeout = new Promise<void>((r) => window.setTimeout(r, 2500));
    const failsafe = window.setTimeout(start, 4000);
    Promise.race([Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), preloadImage(ASSETS.plate)]), timeout])
      .then(() => {
        if (cancelled) return;
        window.clearTimeout(failsafe);
        window.setTimeout(start, 60);
      })
      .catch(() => start());
    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
    };
  }, []);

  /* --------------------------------------------------------- transition */

  const playTransition = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      let raf = 0;
      let done = false;
      const started = performance.now();
      const finish = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        video.removeEventListener('ended', finish);
        video.removeEventListener('error', finish);
        resolve();
      };
      const tick = () => {
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 5.04;
        const p = video.currentTime / dur;
        try {
          video.playbackRate = Math.max(1.2, 1.8 + 2.4 * Math.sin(Math.PI * Math.min(p * 1.08, 1)));
        } catch {
          /* ignore */
        }
        // If the clip never starts (blocked / 404 / still buffering), bail out gracefully.
        if (video.currentTime === 0 && performance.now() - started > 1600) {
          finish();
          return;
        }
        if (video.currentTime >= dur - 0.05 || video.ended) {
          finish();
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      video.addEventListener('ended', finish);
      video.addEventListener('error', finish);
      try {
        const promise = video.play() as Promise<void> | undefined;
        if (promise && typeof promise.catch === 'function') promise.catch(finish);
      } catch {
        finish();
      }
      raf = requestAnimationFrame(tick);
    });

  const toCase = useCallback(async () => {
    if (busyRef.current || modeRef.current === 'case') return;
    busyRef.current = true;
    setBusy(true);
    setHeroOut(true);
    setBadgeSway(false);
    await sleep(330);
    setHeroIn(false);
    setHeroOut(false);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const trans = transRef.current;
    const frame = frameRef.current;
    const useVideo = !reduce && trans && !transFailed.current;

    frame?.classList.add('glide');
    frame?.style.setProperty('--glide', '1.6s');

    if (plateRef.current) plateRef.current.style.visibility = 'hidden';
    if (cutRef.current) cutRef.current.style.opacity = '0';
    if (caseplateRef.current) caseplateRef.current.style.opacity = '1';

    if (useVideo && trans) {
      trans.currentTime = 0;
      trans.style.opacity = '1';
      await twoFrames();
      pose('case');
      await Promise.race([playTransition(trans), sleep(7000)]);
      trans.style.opacity = '0';
      trans.pause();
    } else {
      pose('case');
      await sleep(120);
    }

    modeRef.current = 'case';
    setMode('case');
    setCaseUi(true);
    window.setTimeout(() => frame?.classList.remove('glide'), 1700);
    busyRef.current = false;
    setBusy(false);
  }, [pose]);

  const toHero = useCallback(async () => {
    if (busyRef.current || modeRef.current === 'hero') return;
    busyRef.current = true;
    setBusy(true);
    setCaseUi(false);
    setModal(null);
    await sleep(240);

    const frame = frameRef.current;
    frame?.classList.add('glide');
    frame?.style.setProperty('--glide', '1.35s');
    pose('hero');
    modeRef.current = 'hero';
    setMode('hero');

    if (transRef.current) transRef.current.style.opacity = '0';
    if (caseplateRef.current) caseplateRef.current.style.opacity = '0';
    if (plateRef.current) {
      plateRef.current.style.visibility = 'visible';
      plateRef.current.style.opacity = '1';
    }
    if (cutRef.current) cutRef.current.style.opacity = '1';

    await sleep(420);
    setBadgeCycle((c) => c + 1);
    setHeroIn(true);
    setBadgeSway(true);
    window.setTimeout(() => frame?.classList.remove('glide'), 1500);
    busyRef.current = false;
    setBusy(false);
  }, [pose]);

  const goToProject = useCallback((delta: number) => {
    if (!projects.length) return;
    setFlash(true);
    window.setTimeout(() => setFlash(false), 240);
    setTicketRock(true);
    window.setTimeout(() => setTicketRock(false), 300);
    setIndex((i) => (i + delta + projects.length) % projects.length);
  }, [projects.length]);

  /* -------------------------------------------------------------- input */

  const modalOpen = modal !== null;

  useEffect(() => {
    document.body.classList.toggle('modal-open', modalOpen);
    return () => document.body.classList.remove('modal-open');
  }, [modalOpen]);

  const openProject = useCallback((id: string) => {
    const i = projects.findIndex((p) => p.id === id);
    if (i >= 0) setIndex(i);
    setModal({ type: 'project', id });
  }, [projects]);

  useEffect(() => {
    if (modalOpen) return;

    const onWheel = (e: WheelEvent) => {
      if (busyRef.current) return;
      if (modeRef.current === 'hero' && e.deltaY >= 18) void toCase();
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      if (busyRef.current) return;
      if (modeRef.current === 'hero') {
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
          e.preventDefault();
          void toCase();
        }
      } else {
        if (e.key === 'Escape') void toHero();
        if (e.key === 'ArrowRight') goToProject(1);
        if (e.key === 'ArrowLeft') goToProject(-1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || busyRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (modeRef.current === 'hero' && dy < -40 && Math.abs(dy) > Math.abs(dx)) void toCase();
      if (modeRef.current === 'case' && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) goToProject(dx < 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [modalOpen, toCase, toHero, goToProject]);

  /* --------------------------------------------------------------- badge */

  const badgeRows = cms.badge.rows || [];
  const showcaseProject = modal?.type === 'project' ? projects.find((p) => p.id === modal.id) : undefined;

  const startSwing = () => {
    if (mode !== 'hero') return;
    setSwinging(true);
    window.setTimeout(() => setSwinging(false), 1450);
  };

  return (
    <>
      <div className="stage" aria-label="AB VISUALS studio">
        <div className="frame" ref={frameRef} data-in={heroIn ? '1' : '0'} data-out={heroOut ? '1' : '0'}>
          <img className="plate" ref={plateRef} src={ASSETS.plate} alt="AB VISUALS studio hero" draggable={false} />
          <svg className="wm" ref={wmRef} viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="wmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#f1f5f3" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d7e6de" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <text
              x="18"
              y="212"
              textLength="1404"
              lengthAdjust="spacingAndGlyphs"
              fill="url(#wmGrad)"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
                fontSize: 246,
                letterSpacing: '-5px',
              }}
            >
              {cms.hero.wordmark}
            </text>
          </svg>
          <img className="cut" ref={cutRef} src={ASSETS.cut} alt="" aria-hidden="true" draggable={false} />
          <div
            className={`badge ${heroIn && !heroOut ? 'drop' : ''} ${heroOut ? 'out' : ''} ${badgeSway ? 'sway' : ''} ${
              swinging ? 'swinging' : ''
            }`}
            key={badgeCycle}
            ref={badgeRef}
          >
            <div className="badge-swing">
              <img src={ASSETS.badge} alt="AB VISUALS lanyard ID badge" draggable={false} />
              <div className="card">
                <h4>{cms.badge.heading}</h4>
                <span className="yr">{cms.badge.year}</span>
                <div className="role">{cms.badge.role}</div>
                <div
                  className="ph"
                  style={
                    cms.badge.photoUrl
                      ? { backgroundImage: `url(${cms.badge.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { backgroundImage: `url(${ASSETS.cut})`, backgroundSize: '471px 313px', backgroundPosition: '-212px -16px' }
                  }
                />
                <div className="rows">
                  {badgeRows.map((row, i) => (
                    <div className="row" key={`${row.label}-${i}`}>
                      <span>{row.label}</span>
                      <span>{resolveBadgeValue(row.value, cms)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hit" onPointerEnter={startSwing} aria-hidden="true" />
          </div>

          <div className="script" ref={scriptRef}>
            {cms.hero.script}
          </div>

          <video
            className="trans"
            ref={transRef}
            src={ASSETS.trans}
            muted
            playsInline
            preload="auto"
            onError={() => {
              transFailed.current = true;
            }}
          />

          <img className="caseplate" ref={caseplateRef} src={ASSETS.casePlate} alt="" aria-hidden="true" draggable={false} />

          <div className={`screen ${caseUi ? 'on' : ''}`}>
            {activeProject ? <ScreenPreview project={activeProject} /> : null}
            <div className={`flash ${flash ? 'go' : ''}`} />
            {activeProject ? (
              <div className="cue">
                <PlayIcon className="w-3 h-3" />
                {cms.labels.screenPrompt}
                <b>
                  · {(activeProject.gallery_images || []).length} Photos ·{' '}
                  {(activeProject.youtube_urls || []).length ? 'Video' : 'Story'}
                </b>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={`screen-hit ${caseUi && activeProject ? 'on' : ''}`}
            aria-label={activeProject ? `Open ${activeProject.title} full screen` : 'Open project'}
            onClick={() => activeProject && setModal({ type: 'project', id: activeProject.id })}
          />
        </div>
      </div>

      <div className="ui">
        <nav className="tags" data-in={heroIn ? '1' : '0'} data-out={heroOut ? '1' : '0'} aria-label="Primary">
          <button
            type="button"
            className="tag t1"
            style={tagStyle(0)}
            onClick={() => (mode === 'case' ? void toHero() : setModal({ type: 'contact' }))}
          >
            {cms.nav.studio}
          </button>
          <button
            type="button"
            className="tag t2"
            style={tagStyle(1)}
            onClick={() => (mode === 'case' ? setModal({ type: 'all' }) : void toCase())}
          >
            {cms.nav.portfolio}
          </button>
          <button type="button" className="tag t3" style={tagStyle(2)} onClick={() => setModal({ type: 'contact' })}>
            {cms.nav.services}
          </button>
          <button type="button" className="tag t4" style={tagStyle(3)} onClick={() => setModal({ type: 'book' })}>
            {cms.nav.book}
          </button>
        </nav>

        <button type="button" className={`logo ${mode === 'case' ? 'show' : ''}`} onClick={() => void toHero()}>
          {cms.nav.logo}
        </button>

        <div className={`mini-badge ${heroIn && mode === 'hero' ? 'show' : ''}`}>
          <div className="mb-top">
            <div className="mb-head">{cms.badge.heading}</div>
            <div className="mb-yr">{cms.badge.year}</div>
          </div>
          <div className="mb-role">{cms.badge.role}</div>
          <div className="mb-rows">
            {badgeRows.slice(0, 2).map((row, i) => (
              <div key={`${row.label}-${i}`}>
                <span>{row.label}</span>
                <span>{resolveBadgeValue(row.value, cms)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`scrollhint ${mode === 'case' || busy ? 'hidden' : ''}`}>
          <span>{cms.hero.scrollHint}</span>
          <span className="line" />
        </div>

        <SocialBar cms={cms} hidden={busy} />

        {activeProject && (
          <>
            <aside className={`ticket ${caseUi ? 'show' : ''} ${ticketRock ? 'rock' : ''}`} aria-live="polite">
              <span className="punch a" />
              <span className="punch b" />
              <span className="punch c" />
              <span className="punch d" />
              <h2>{activeProject.title}</h2>
              <div className="rows">
                {(activeProject.ticket_rows || []).map((row, i) => (
                  <div key={i}>{row}</div>
                ))}
              </div>
              <button type="button" className="cta" onClick={() => setModal({ type: 'project', id: activeProject.id })}>
                {cms.labels.ticketCta}
              </button>
            </aside>

            <div className={`case-left ${caseUi ? 'show' : ''}`}>
              <span className="badge-pill">{activeProject.category}</span>
              <div className="k">{activeProject.short_key}</div>
              <p>{activeProject.short_desc}</p>
              <div className="num">
                {pad2(index + 1)} / {pad2(projects.length)}
              </div>
              <button type="button" className="browse" onClick={() => setModal({ type: 'all' })}>
                <GridIcon className="w-3 h-3" /> Browse All Projects
              </button>
            </div>

            <button type="button" className={`cbtn prev ${caseUi ? 'show' : ''}`} onClick={() => goToProject(-1)} aria-label="Previous project">
              <span className="c">
                <ArrowLeft />
              </span>
              <span className="lbl">{cms.labels.prev}</span>
            </button>
            <button type="button" className={`cbtn next ${caseUi ? 'show' : ''}`} onClick={() => goToProject(1)} aria-label="Next project">
              <span className="c">
                <ArrowRight />
              </span>
              <span className="lbl">{cms.labels.next}</span>
            </button>
          </>
        )}
      </div>

      {modal?.type === 'project' && showcaseProject && (
        <Showcase
          project={showcaseProject}
          projects={projects}
          cms={cms}
          onClose={() => setModal(null)}
          onOpenProject={(id) => setModal({ type: 'project', id })}
          onContact={() => setModal({ type: 'contact' })}
        />
      )}
      {modal?.type === 'all' && (
        <AllProjects
          projects={projects}
          cms={cms}
          activeId={activeId}
          onClose={() => setModal(null)}
          onOpenProject={(id) => openProject(id)}
        />
      )}
      {modal?.type === 'contact' && <ContactDrawer cms={cms} onClose={() => setModal(null)} />}
      {modal?.type === 'book' && <BookingModal cms={cms} onClose={() => setModal(null)} />}
    </>
  );
}
