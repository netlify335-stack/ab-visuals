import { useRef, useState } from 'react';
import { useData } from '../../lib/DataContext';
import { deleteImage, uploadImage } from '../../lib/store';
import { SERVICE_CATEGORIES } from '../../lib/defaults';
import { imgFallback, slugify, uid } from '../../lib/format';
import { parseYouTubeId, youtubeEmbedUrl } from '../../lib/youtube';
import type { GalleryImage, Project } from '../../lib/types';
import { Card, Field, Toggle } from './AdminUI';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CloseIcon,
  ImageIcon,
  PlayIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '../Icons';

type Props = { toast: (msg: string, error?: boolean) => void };

type Upload = { key: string; name: string; pct: number; error?: string };

const blankProject = (order: number, category: string): Project => ({
  id: uid(),
  title: 'NEW PROJECT',
  slug: 'new-project',
  category,
  location: '',
  year: String(new Date().getFullYear()),
  ticket_rows: [category.toUpperCase().slice(0, 22), 'AERIAL & GROUND', String(new Date().getFullYear())],
  short_key: '// new project',
  short_desc: '',
  full_description: '',
  youtube_urls: [],
  preview_video_url: null,
  cover_image_url: '',
  gallery_images: [],
  sort_order: order,
  is_published: true,
});

export default function ProjectsTab({ toast }: Props) {
  const { projects, content, persistProject, removeProject, reorderProjects } = useData();
  const [editing, setEditing] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);

  const create = () => {
    const p = blankProject(projects.length + 1, content.services[0]?.title || SERVICE_CATEGORIES[0]);
    setEditing(p);
  };

  const move = async (index: number, dir: number) => {
    const next = [...projects];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await reorderProjects(next);
  };

  const togglePublished = async (project: Project) => {
    await persistProject({ ...project, is_published: !project.is_published });
    toast(project.is_published ? 'Moved to draft' : 'Published live');
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await removeProject(project.id);
      toast('Project deleted');
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <ProjectEditor
        key={editing.id}
        draft={editing}
        onClose={() => setEditing(null)}
        toast={toast}
        onSaved={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h2 className="adm-page-title">Projects</h2>
          <p className="adm-page-sub">
            {projects.length} projects · upload unlimited photos straight from your phone or laptop, add YouTube films and
            they appear live for every visitor.
          </p>
        </div>
        <button type="button" className="adm-btn primary" onClick={create}>
          <PlusIcon className="w-3.5 h-3.5" /> Create New Project
        </button>
      </div>

      {!projects.length && <div className="adm-empty">No projects yet — create your first one above.</div>}

      <div className="adm-list">
        {projects.map((p, i) => (
          <div className="adm-item" key={p.id}>
            <div className="thumb">
              {p.cover_image_url ? <img src={p.cover_image_url} alt="" loading="lazy" onError={imgFallback} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}><ImageIcon className="w-5 h-5" /></div>}
            </div>
            <div className="main">
              <strong>{p.title}</strong>
              <div className="meta">
                {p.category} · {p.location || '—'} · {p.year} · {(p.gallery_images || []).length} photos ·{' '}
                {(p.youtube_urls || []).length} videos
              </div>
            </div>
            <div className="side">
              <button
                type="button"
                className={`adm-pill ${p.is_published ? 'live' : 'draft'}`}
                onClick={() => void togglePublished(p)}
                title="Toggle published / draft"
                style={{ cursor: 'pointer' }}
              >
                {p.is_published ? 'live' : 'draft'}
              </button>
              <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => void move(i, -1)} aria-label="Move up">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                disabled={i === projects.length - 1}
                onClick={() => void move(i, 1)}
                aria-label="Move down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="adm-btn dark tiny" onClick={() => setEditing(p)}>
                Edit
              </button>
              <button type="button" className="adm-icon-btn" onClick={() => void remove(p)} disabled={busy} aria-label="Delete project">
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ editor */

function ProjectEditor({
  draft: initial,
  onClose,
  onSaved,
  toast,
}: {
  draft: Project;
  onClose: () => void;
  onSaved: () => void;
  toast: (msg: string, error?: boolean) => void;
}) {
  const { content, persistProject } = useData();
  const [draft, setDraft] = useState<Project>(initial);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Project>(key: K, value: Project[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const setRow = (i: number, value: string) => {
    const rows = [...(draft.ticket_rows || [])];
    rows[i] = value;
    set('ticket_rows', rows);
  };

  const autoFillRows = () => {
    setDraft((d) => ({
      ...d,
      ticket_rows: [d.category.toUpperCase(), d.location.split(',')[0]?.toUpperCase() || 'AERIAL & GROUND', d.year],
    }));
  };

  const handleFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    const entries: Upload[] = images.map((f, i) => ({ key: `${Date.now()}-${i}-${f.name}`, name: f.name, pct: 0 }));
    setUploads((prev) => [...prev, ...entries]);

    for (let i = 0; i < images.length; i++) {
      const entry = entries[i];
      try {
        const uploaded = await uploadImage(images[i], (pct) =>
          setUploads((prev) => prev.map((u) => (u.key === entry.key ? { ...u, pct } : u)))
        );
        setDraft((d) => ({
          ...d,
          gallery_images: [...(d.gallery_images || []), uploaded],
          cover_image_url: d.cover_image_url || uploaded.url,
        }));
      } catch (err) {
        setUploads((prev) =>
          prev.map((u) => (u.key === entry.key ? { ...u, pct: 100, error: (err as Error).message } : u))
        );
      }
    }
    window.setTimeout(() => {
      setUploads((prev) => prev.filter((u) => !entries.some((e) => e.key === u.key)));
    }, 1200);
  };

  const removePhoto = async (img: GalleryImage) => {
    setDraft((d) => ({
      ...d,
      gallery_images: d.gallery_images.filter((g) => g.id !== img.id),
      cover_image_url: d.cover_image_url === img.url ? d.gallery_images.find((g) => g.id !== img.id)?.url || '' : d.cover_image_url,
    }));
    try {
      await deleteImage(img.url);
    } catch {
      /* storage cleanup is best effort */
    }
  };

  const movePhoto = (i: number, dir: number) => {
    const list = [...draft.gallery_images];
    const t = i + dir;
    if (t < 0 || t >= list.length) return;
    [list[i], list[t]] = [list[t], list[i]];
    set('gallery_images', list);
  };

  const updatePhoto = (id: string, patch: Partial<GalleryImage>) =>
    set('gallery_images', draft.gallery_images.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const save = async () => {
    setSaving(true);
    try {
      await persistProject({ ...draft, slug: draft.slug || slugify(draft.title) });
      toast('Project saved — live on the site');
      onSaved();
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setSaving(false);
    }
  };

  const categories = Array.from(new Set([...SERVICE_CATEGORIES, ...content.services.map((s) => s.title)]));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <button type="button" className="adm-back" onClick={onClose}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="adm-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      </div>

      <div className="adm-note info">
        <ImageIcon className="w-4 h-4" /> Photos are compressed to crisp WebP (max 2048px) in your browser before upload, so
        DSLR and drone files stay fast on the live site.
      </div>

      <Card title="Project details">
        <div className="adm-grid2">
          <Field label="Title" full>
            <input className="adm-input" value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="UDAIPUR ROYAL WEDDING" />
          </Field>
          <Field label="Service category">
            <input
              className="adm-input"
              list="abv-categories"
              value={draft.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Wedding Cinematography"
            />
            <datalist id="abv-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Year">
            <input className="adm-input" value={draft.year} onChange={(e) => set('year', e.target.value)} placeholder="2026" />
          </Field>
          <Field label="Location">
            <input className="adm-input" value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder="Udaipur, India" />
          </Field>
          <Field label="URL slug" hint="Used for deep links and the project archive.">
            <input
              className="adm-input"
              value={draft.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="udaipur-royal-wedding"
            />
          </Field>
          <Field label="Laptop view key line" hint="Shown above the short description in the laptop view.">
            <input className="adm-input" value={draft.short_key} onChange={(e) => set('short_key', e.target.value)} placeholder="// udaipur royal wedding" />
          </Field>
          <Field label="Short teaser" hint="One sentence shown on the laptop screen panel.">
            <input className="adm-input" value={draft.short_desc} onChange={(e) => set('short_desc', e.target.value)} placeholder="— a grand palace wedding…" />
          </Field>
          <Field label="Full project story" full hint="Shown in the full-screen cinema showcase.">
            <textarea
              className="adm-textarea"
              value={draft.full_description}
              onChange={(e) => set('full_description', e.target.value)}
              placeholder="How the shoot unfolded, deliverables, highlights…"
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Ticket card metadata"
        desc="The three uppercase lines printed on the paper ticket."
        action={
          <button type="button" className="adm-btn dark tiny" onClick={autoFillRows}>
            Auto-fill from details
          </button>
        }
      >
        <div className="adm-grid3">
          {[0, 1, 2].map((i) => (
            <Field key={i} label={`Line ${i + 1}`}>
              <input className="adm-input" value={draft.ticket_rows?.[i] || ''} onChange={(e) => setRow(i, e.target.value)} />
            </Field>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <Toggle checked={draft.is_published} onChange={(v) => set('is_published', v)} label="Published (visible to visitors)" />
        </div>
      </Card>

      <Card title="YouTube films" desc="Paste any YouTube link — watch, youtu.be, shorts or embed. Plays inline in HD with sound.">
        <div className="adm-yt">
          {(draft.youtube_urls || []).map((url, i) => {
            const id = parseYouTubeId(url);
            return (
              <div key={i} className="adm-yt-row">
                <input
                  className="adm-input"
                  value={url}
                  placeholder="https://youtube.com/watch?v=…"
                  onChange={(e) => {
                    const next = [...draft.youtube_urls];
                    next[i] = e.target.value;
                    set('youtube_urls', next);
                  }}
                />
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label="Remove video"
                  onClick={() => set('youtube_urls', draft.youtube_urls.filter((_, idx) => idx !== i))}
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
                <span className={`adm-pill ${id ? 'live' : 'draft'}`}>{id ? 'valid' : 'check link'}</span>
              </div>
            );
          })}
          <button type="button" className="adm-btn dark" style={{ alignSelf: 'flex-start' }} onClick={() => set('youtube_urls', [...(draft.youtube_urls || []), ''])}>
            <PlusIcon className="w-3.5 h-3.5" /> Add Another YouTube Video
          </button>
        </div>

        {(draft.youtube_urls || []).filter((u) => parseYouTubeId(u)).length > 0 && (
          <div className="adm-yt-previews">
            {draft.youtube_urls
              .filter((u) => parseYouTubeId(u))
              .slice(0, 4)
              .map((url, i) => (
                <div className="adm-yt-preview" key={url + i}>
                  <div className="frame">
                    <iframe
                      src={youtubeEmbedUrl(parseYouTubeId(url)!)}
                      title={`YouTube preview ${i + 1}`}
                      allow="encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  </div>
                  <div className="cap">
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <PlayIcon className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} />
                      {parseYouTubeId(url)}
                    </span>
                    <span>live preview</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Field
            label="Optional direct MP4 preview (loops inside the laptop screen)"
            hint="Leave empty to use the YouTube film or the cover photo slideshow."
          >
            <input
              className="adm-input"
              value={draft.preview_video_url || ''}
              onChange={(e) => set('preview_video_url', e.target.value || null)}
              placeholder="https://…/preview.mp4"
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Photos"
        desc="Drag & drop or pick unlimited photos from your phone or computer. First photo becomes the cover unless you choose another."
      >
        <div
          className={`adm-drop ${dragOver ? 'drag' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <ImageIcon className="w-6 h-6" style={{ opacity: 0.7 }} />
          <strong>Upload Photos from Phone or Computer</strong>
          <span>Tap to browse · select 10, 30, 50+ at once · add more batches anytime</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void handleFiles(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
        </div>

        {uploads.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {uploads.map((u) => (
              <div className="adm-progress" key={u.key}>
                <span style={{ width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                <span className="track">
                  <span className="bar" style={{ width: `${u.pct}%`, background: u.error ? '#d64545' : undefined }} />
                </span>
                <span>{u.error ? 'failed' : `${Math.round(u.pct)}%`}</span>
              </div>
            ))}
          </div>
        )}

        {draft.gallery_images.length > 0 && (
          <div className="adm-photos">
            {draft.gallery_images.map((img, i) => (
              <div className={`adm-photo ${draft.cover_image_url === img.url ? 'cover' : ''}`} key={img.id}>
                <div className="ph-img">
                  <img src={img.url} alt={img.caption || ''} loading="lazy" />
                  {draft.cover_image_url === img.url && <span className="ph-cover-flag">cover</span>}
                </div>
                <div className="ph-tools">
                  <button type="button" onClick={() => set('cover_image_url', img.url)} title="Set as cover">
                    <StarIcon className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => movePhoto(i, -1)} title="Move left" disabled={i === 0}>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => movePhoto(i, 1)} title="Move right" disabled={i === draft.gallery_images.length - 1}>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button type="button" className="del" onClick={() => void removePhoto(img)} title="Delete photo">
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
                <input
                  className="caption"
                  value={img.caption || ''}
                  placeholder="Caption…"
                  onChange={(e) => updatePhoto(img.id, { caption: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button type="button" className="adm-btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Project'}
        </button>
      </div>
    </>
  );
}
