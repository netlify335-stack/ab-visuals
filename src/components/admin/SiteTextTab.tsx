import { useRef, useState } from 'react';
import { ASSETS } from '../../lib/defaults';
import { useData } from '../../lib/DataContext';
import { uid } from '../../lib/format';
import { deleteImage, uploadSiteImage } from '../../lib/store';
import type { SiteContent } from '../../lib/types';
import { Card, Field } from './AdminUI';
import { ChevronDown, ChevronUp, ImageIcon, PlusIcon, TrashIcon } from '../Icons';

export default function SiteTextTab({ toast }: { toast: (m: string, e?: boolean) => void }) {
  const { content, updateContent } = useData();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setHero = <K extends keyof SiteContent['hero']>(key: K, value: string) =>
    setDraft((d) => ({ ...d, hero: { ...d.hero, [key]: value } }));
  const setBadge = <K extends keyof SiteContent['badge']>(key: K, value: SiteContent['badge'][K]) =>
    setDraft((d) => ({ ...d, badge: { ...d.badge, [key]: value } }));
  const setNav = <K extends keyof SiteContent['nav']>(key: K, value: string) =>
    setDraft((d) => ({ ...d, nav: { ...d.nav, [key]: value } }));
  const setLabel = <K extends keyof SiteContent['labels']>(key: K, value: string) =>
    setDraft((d) => ({ ...d, labels: { ...d.labels, [key]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      await updateContent(draft);
      toast('Website text & services updated');
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setSaving(false);
    }
  };

  const uploadBadgePhoto = async (file: File) => {
    try {
      const url = await uploadSiteImage(file, setPhotoBusy);
      setBadge('photoUrl', url);
      toast('Badge photo updated — remember to save');
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setPhotoBusy(0);
    }
  };

  const resetBadgePhoto = async () => {
    const current = draft.badge.photoUrl;
    setBadge('photoUrl', null);
    if (current) {
      try {
        await deleteImage(current);
      } catch {
        /* ignore */
      }
    }
  };

  const setService = (id: string, patch: Partial<SiteContent['services'][number]>) =>
    set('services', draft.services.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const moveService = (i: number, dir: number) => {
    const list = [...draft.services];
    const t = i + dir;
    if (t < 0 || t >= list.length) return;
    [list[i], list[t]] = [list[t], list[i]];
    set('services', list);
  };

  return (
    <>
      <h2 className="adm-page-title">Website Text &amp; Services</h2>
      <p className="adm-page-sub">Every headline, badge field, nav label and service on the public site is editable here.</p>

      <Card title="Hero" desc="The studio hero screen.">
        <div className="adm-grid2">
          <Field label="Giant background wordmark" full hint="Sits behind the pilot's head. Keep it short for the best fit.">
            <input className="adm-input" value={draft.hero.wordmark} onChange={(e) => setHero('wordmark', e.target.value)} />
          </Field>
          <Field label="Handwritten script tagline" full>
            <textarea className="adm-textarea" value={draft.hero.script} onChange={(e) => setHero('script', e.target.value)} style={{ minHeight: 62 }} />
          </Field>
          <Field label="Scroll hint" full>
            <input className="adm-input" value={draft.hero.scrollHint} onChange={(e) => setHero('scrollHint', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card
        title="Lanyard ID badge"
        desc="The swinging pilot badge on the hero. Contact-row values support {instagram}, {phone}, {email} tokens."
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div
            style={{
              width: 92,
              height: 112,
              borderRadius: 6,
              background: '#dfe4e1',
              backgroundImage: `url(${draft.badge.photoUrl || ASSETS.cut})`,
              backgroundSize: draft.badge.photoUrl ? 'cover' : '471px 313px',
              backgroundPosition: draft.badge.photoUrl ? 'center' : '-212px -16px',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)',
              flex: 'none',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="adm-btn dark" onClick={() => fileRef.current?.click()}>
                <ImageIcon className="w-3.5 h-3.5" /> Upload badge photo
              </button>
              {draft.badge.photoUrl ? (
                <button type="button" className="adm-btn ghost" onClick={() => void resetBadgePhoto()}>
                  Reset to studio cutout
                </button>
              ) : null}
            </div>
            <span className="adm-hint">Portrait crop works best · stored with your site media.</span>
            {photoBusy > 0 ? (
              <div className="adm-progress">
                <span className="track">
                  <span className="bar" style={{ width: `${photoBusy}%` }} />
                </span>
                <span>{photoBusy}%</span>
              </div>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadBadgePhoto(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <div className="adm-grid3">
          <Field label="Badge heading" hint="Use a new line for two-row headings.">
            <textarea
              className="adm-textarea"
              style={{ minHeight: 58 }}
              value={draft.badge.heading}
              onChange={(e) => setBadge('heading', e.target.value)}
            />
          </Field>
          <Field label="Badge year">
            <input className="adm-input" value={draft.badge.year} onChange={(e) => setBadge('year', e.target.value)} />
          </Field>
          <Field label="Role subtitle">
            <input className="adm-input" value={draft.badge.role} onChange={(e) => setBadge('role', e.target.value)} />
          </Field>
        </div>

        <div className="adm-grid2" style={{ marginTop: 12 }}>
          {draft.badge.rows.map((row, i) => (
            <div key={i} className="adm-grid2" style={{ gap: 8 }}>
              <Field label={`Row ${i + 1} label`}>
                <input
                  className="adm-input"
                  value={row.label}
                  onChange={(e) =>
                    setBadge(
                      'rows',
                      draft.badge.rows.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r))
                    )
                  }
                />
              </Field>
              <Field label={`Row ${i + 1} value`}>
                <input
                  className="adm-input"
                  value={row.value}
                  onChange={(e) =>
                    setBadge(
                      'rows',
                      draft.badge.rows.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r))
                    )
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Navigation & laptop-view labels">
        <div className="adm-grid2">
          <Field label="Tag 1 (studio)">
            <input className="adm-input" value={draft.nav.studio} onChange={(e) => setNav('studio', e.target.value)} />
          </Field>
          <Field label="Tag 2 (portfolio)">
            <input className="adm-input" value={draft.nav.portfolio} onChange={(e) => setNav('portfolio', e.target.value)} />
          </Field>
          <Field label="Tag 3 (services)">
            <input className="adm-input" value={draft.nav.services} onChange={(e) => setNav('services', e.target.value)} />
          </Field>
          <Field label="Tag 4 (booking)">
            <input className="adm-input" value={draft.nav.book} onChange={(e) => setNav('book', e.target.value)} />
          </Field>
          <Field label="Case-mode centre logo">
            <input className="adm-input" value={draft.nav.logo} onChange={(e) => setNav('logo', e.target.value)} />
          </Field>
          <Field label="All-projects heading">
            <input className="adm-input" value={draft.labels.allProjectsHeading} onChange={(e) => setLabel('allProjectsHeading', e.target.value)} />
          </Field>
          <Field label="Ticket expand button">
            <input className="adm-input" value={draft.labels.ticketCta} onChange={(e) => setLabel('ticketCta', e.target.value)} />
          </Field>
          <Field label="Laptop hover prompt">
            <input className="adm-input" value={draft.labels.screenPrompt} onChange={(e) => setLabel('screenPrompt', e.target.value)} />
          </Field>
          <Field label="Previous button (use a new line)">
            <input className="adm-input" value={draft.labels.prev} onChange={(e) => setLabel('prev', e.target.value)} />
          </Field>
          <Field label="Next button (use a new line)">
            <input className="adm-input" value={draft.labels.next} onChange={(e) => setLabel('next', e.target.value)} />
          </Field>
          <Field label="Showcase WhatsApp CTA">
            <input className="adm-input" value={draft.labels.showcaseEnquire} onChange={(e) => setLabel('showcaseEnquire', e.target.value)} />
          </Field>
          <Field label="Showcase close label">
            <input className="adm-input" value={draft.labels.showcaseClose} onChange={(e) => setLabel('showcaseClose', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card
        title="Services manager"
        desc="Shown in the services & contact drawer and used as booking-form options."
        action={
          <button
            type="button"
            className="adm-btn dark tiny"
            onClick={() =>
              set('services', [
                ...draft.services,
                { id: uid(), title: 'New Service', description: '', tag: 'NEW' },
              ])
            }
          >
            <PlusIcon className="w-3 h-3" /> Add service
          </button>
        }
      >
        {draft.services.map((s, i) => (
          <div key={s.id} className="adm-svc">
            <input className="adm-input" value={s.title} onChange={(e) => setService(s.id, { title: e.target.value })} placeholder="Title" />
            <textarea
              className="adm-textarea svc-desc"
              style={{ minHeight: 40 }}
              value={s.description}
              onChange={(e) => setService(s.id, { description: e.target.value })}
              placeholder="Short description"
            />
            <input className="adm-input" value={s.tag} onChange={(e) => setService(s.id, { tag: e.target.value })} placeholder="TAG" />
            <div style={{ display: 'flex', gap: 3 }}>
              <button type="button" className="adm-icon-btn" onClick={() => moveService(i, -1)} disabled={i === 0} aria-label="Move up">
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => moveService(i, 1)}
                disabled={i === draft.services.length - 1}
                aria-label="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => set('services', draft.services.filter((x) => x.id !== s.id))}
                aria-label="Delete service"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="adm-btn ghost" onClick={() => setDraft(content)}>
          Discard changes
        </button>
        <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save website text'}
        </button>
      </div>
    </>
  );
}
