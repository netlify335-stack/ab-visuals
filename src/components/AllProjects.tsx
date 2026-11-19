import { useEffect, useMemo, useState } from 'react';
import { imgFallback } from '../lib/format';
import { parseYouTubeId } from '../lib/youtube';
import type { Project, SiteContent } from '../lib/types';
import { ArrowUpRight, CloseIcon, ImageIcon, PlayIcon } from './Icons';

type Props = {
  projects: Project[];
  cms: SiteContent;
  activeId?: string;
  onClose: () => void;
  onOpenProject: (id: string) => void;
};

export default function AllProjects({ projects, cms, activeId, onClose, onOpenProject }: Props) {
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const list = projects.filter((p) => filter === 'All' || p.category === filter);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="All projects" onClick={onClose}>
      <div className="sheet" style={{ width: 'min(1080px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
              {cms.labels.allProjectsHeading}
            </h2>
            <p style={{ margin: '5px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>
              {projects.length} films &amp; shoots · tap a card to open its cinema view
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close all projects">
            <CloseIcon />
          </button>
        </div>

        <div className="filters">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={filter === cat ? 'active' : ''}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="proj-grid">
          {list.map((p) => {
            const videoCount = (p.youtube_urls || []).filter((u) => parseYouTubeId(u)).length;
            return (
              <button
                key={p.id}
                type="button"
                className="proj-card"
                onClick={() => onOpenProject(p.id)}
                style={p.id === activeId ? { borderColor: 'var(--mint)' } : undefined}
              >
                <div className="cover">
                  <img src={p.cover_image_url} alt={p.title} loading="lazy" onError={imgFallback} />
                  {videoCount > 0 && (
                    <span className="chip tl">
                      <PlayIcon className="w-2.5 h-2.5" /> {videoCount} film{videoCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="chip tr">
                    <ImageIcon className="w-2.5 h-2.5" /> {(p.gallery_images || []).length}
                  </span>
                  {p.id === activeId && <span className="chip active-case" style={{ bottom: 8, left: 8 }}>ON SCREEN</span>}
                </div>
                <div className="info">
                  <h4>{p.title}</h4>
                  <div className="meta">
                    {p.category} · {p.year}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!list.length && <div className="adm-empty" style={{ margin: '0 28px 28px' }}>No projects in this category yet.</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 28px 24px', color: 'rgba(255,255,255,.42)', fontSize: 11, alignItems: 'center', gap: 6 }}>
          Managed live from the studio CMS <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
