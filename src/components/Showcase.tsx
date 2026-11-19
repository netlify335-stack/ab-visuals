import { useEffect, useMemo, useState } from 'react';
import { imgFallback, waLink } from '../lib/format';
import { parseYouTubeId, youtubeEmbedUrl, youtubeThumb } from '../lib/youtube';
import type { Project, SiteContent } from '../lib/types';
import Lightbox from './Lightbox';
import SocialBar from './SocialBar';
import { ArrowRight, CloseIcon, ImageIcon, InstagramIcon, WhatsAppIcon } from './Icons';

type Props = {
  project: Project;
  projects: Project[];
  cms: SiteContent;
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onContact: () => void;
};

export default function Showcase({ project, projects, cms, onClose, onOpenProject, onContact }: Props) {
  const videos = useMemo(
    () => (project.youtube_urls || []).map((url) => ({ url, id: parseYouTubeId(url) })).filter((v) => v.id),
    [project.youtube_urls]
  );
  const [videoIndex, setVideoIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    setVideoIndex(0);
    setLightbox(null);
  }, [project.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightbox === null) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, lightbox]);

  const nextProject = useMemo(() => {
    if (projects.length < 2) return null;
    const i = projects.findIndex((p) => p.id === project.id);
    return projects[(i + 1) % projects.length];
  }, [projects, project.id]);

  const gallery = project.gallery_images || [];
  const waMessage = `Hi ${cms.contact.brandName}, I loved your project "${project.title}" and want to discuss a shoot!`;
  const activeVideo = videos[videoIndex];

  return (
    <div className="showcase" role="dialog" aria-modal="true" aria-label={`${project.title} project showcase`}>
      <header className="sc-head">
        <div className="sc-head-inner">
          <div className="sc-title">
            <span className="sc-cat">
              <i style={{ width: 6, height: 6, borderRadius: 9, background: 'currentColor', display: 'inline-block' }} />
              {project.category}
            </span>
            <h1>{project.title}</h1>
            <div className="sc-meta">
              {[project.location, project.year, `${gallery.length} photos`, videos.length ? `${videos.length} video${videos.length > 1 ? 's' : ''}` : null]
                .filter(Boolean)
                .join('  ·  ')}
            </div>
          </div>
          <div className="sc-actions">
            <a
              className="btn btn-wa"
              href={waLink(cms.contact.whatsappNumber, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{cms.labels.showcaseEnquire}</span>
            </a>
            <button type="button" className="modal-close" onClick={onClose} aria-label={cms.labels.showcaseClose || 'Close project'} title={cms.labels.showcaseClose}>
              <CloseIcon />
            </button>
          </div>
        </div>
      </header>

      <div className="sc-wrap">
        {activeVideo?.id ? (
          <>
            <div className="sc-video">
              <iframe
                key={activeVideo.id}
                src={youtubeEmbedUrl(activeVideo.id)}
                title={`${project.title} video ${videoIndex + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {videos.length > 1 && (
              <div className="video-thumbs">
                {videos.map((v, i) => (
                  <button
                    key={`${v.id}-${i}`}
                    type="button"
                    className={i === videoIndex ? 'active' : ''}
                    onClick={() => setVideoIndex(i)}
                  >
                    <img src={youtubeThumb(v.id as string)} alt="" loading="lazy" onError={imgFallback} />
                    <span>Film {String(i + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="sc-video"
            style={{
              backgroundImage: `url(${project.cover_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="sc-video-fallback">
              <ImageIcon className="w-8 h-8" />
              <strong style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, textTransform: 'uppercase' }}>
                {gallery.length} frame photo film
              </strong>
            </div>
          </div>
        )}

        <section className="sc-story">
          <div>
            <h3>Project Story</h3>
            <p>{project.full_description || project.short_desc}</p>
            <div className="sc-tags">
              <span>{project.category}</span>
              <span>{project.location}</span>
              <span>{project.year}</span>
              {project.preview_video_url ? <span>Preview film</span> : null}
            </div>
          </div>
          <div className="facts-wrap">
            <h3 style={{ marginBottom: 10, fontSize: 13, letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>
              Shoot Overview
            </h3>
            <div className="sc-facts">
              <div className="f">
                <span>Location</span>
                <span>{project.location || '—'}</span>
              </div>
              <div className="f">
                <span>Year</span>
                <span>{project.year || '—'}</span>
              </div>
              <div className="f">
                <span>Category</span>
                <span>{project.category || '—'}</span>
              </div>
              <div className="f">
                <span>Photos</span>
                <span>{gallery.length}</span>
              </div>
              <div className="f">
                <span>Films</span>
                <span>{videos.length}</span>
              </div>
            </div>
            <a
              className="social-card"
              style={{ marginTop: 12 }}
              href={cms.socials.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon className="w-4 h-4" />
              Follow the studio
              <span>{cms.contact.instagramHandle}</span>
            </a>
          </div>
        </section>

        <div className="sc-section-title">
          <h3>Photo Gallery</h3>
          <span>{gallery.length} frames · click to expand</span>
        </div>

        {gallery.length ? (
          <div className="masonry">
            {gallery.map((img, i) => (
              <figure key={img.id || img.url + i} onClick={() => setLightbox(i)}>
                <img
                  src={img.url}
                  alt={img.caption || `${project.title} photo ${i + 1}`}
                  loading={i < 6 ? 'eager' : 'lazy'}
                  width={img.width}
                  height={img.height}
                  onError={imgFallback}
                />
                {img.caption ? <figcaption>{img.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : (
          <div className="adm-empty">No photos uploaded for this project yet.</div>
        )}

        {nextProject && (
          <button type="button" className="sc-next" onClick={() => onOpenProject(nextProject.id)}>
            <div>
              <div className="lbl">Next Project</div>
              <div className="nx">{nextProject.title}</div>
            </div>
            <ArrowRight style={{ width: 30, height: 30, flex: 'none' }} />
          </button>
        )}

        <div className="sc-foot-bar">
          <SocialBar cms={cms} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost" onClick={onContact}>
              Services &amp; Contact
            </button>
            <a
              className="btn btn-primary"
              href={waLink(cms.contact.whatsappNumber, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="w-4 h-4" /> Book this shoot
            </a>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox
          images={gallery}
          index={lightbox}
          title={project.title}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
