import { useState } from 'react';
import { useData } from '../../lib/DataContext';
import { socialsList } from '../../lib/format';
import type { SiteContent } from '../../lib/types';
import { Card, Field, Toggle } from './AdminUI';
import { InstagramIcon, WhatsAppIcon, YouTubeIcon } from '../Icons';

export default function ContactTab({ toast }: { toast: (m: string, e?: boolean) => void }) {
  const { content, updateContent } = useData();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [saving, setSaving] = useState(false);

  const setContact = <K extends keyof SiteContent['contact']>(key: K, value: SiteContent['contact'][K]) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, [key]: value } }));

  const setSocial = <K extends keyof SiteContent['socials']>(key: K, value: SiteContent['socials'][K]) =>
    setDraft((d) => ({ ...d, socials: { ...d.socials, [key]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      await updateContent(draft);
      toast('Contact & social links updated everywhere');
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setSaving(false);
    }
  };

  const links = socialsList(draft);

  return (
    <>
      <h2 className="adm-page-title">Contact &amp; Socials</h2>
      <p className="adm-page-sub">
        These details feed the lanyard ID badge, both contact drawers, WhatsApp CTAs and the bottom social bar — update once,
        change everywhere.
      </p>

      <Card title="Studio identity">
        <div className="adm-grid2">
          <Field label="Brand name">
            <input className="adm-input" value={draft.contact.brandName} onChange={(e) => setContact('brandName', e.target.value)} />
          </Field>
          <Field label="Pilot / lead name">
            <input className="adm-input" value={draft.contact.pilotName} onChange={(e) => setContact('pilotName', e.target.value)} />
          </Field>
          <Field label="Phone number" hint="Used for click-to-call and the badge row.">
            <input className="adm-input" value={draft.contact.phone} onChange={(e) => setContact('phone', e.target.value)} />
          </Field>
          <Field label="Alternate phone">
            <input className="adm-input" value={draft.contact.phoneAlt} onChange={(e) => setContact('phoneAlt', e.target.value)} />
          </Field>
          <Field label="Email address">
            <input className="adm-input" value={draft.contact.email} onChange={(e) => setContact('email', e.target.value)} />
          </Field>
          <Field label="Instagram handle">
            <input className="adm-input" value={draft.contact.instagramHandle} onChange={(e) => setContact('instagramHandle', e.target.value)} />
          </Field>
          <Field label="Studio city / address" full>
            <input className="adm-input" value={draft.contact.address} onChange={(e) => setContact('address', e.target.value)} />
          </Field>
          <Field label="Availability line" full>
            <input className="adm-input" value={draft.contact.availability} onChange={(e) => setContact('availability', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="WhatsApp bookings" desc="Inquiry forms send straight to this number with a pre-filled greeting.">
        <div className="adm-grid2">
          <Field label="WhatsApp number" hint="Country code + number, digits only — e.g. 919876543210">
            <input className="adm-input" value={draft.contact.whatsappNumber} onChange={(e) => setContact('whatsappNumber', e.target.value)} inputMode="tel" />
          </Field>
          <Field label="Direct WhatsApp URL" hint="Leave empty to auto-build from the number above.">
            <input
              className="adm-input"
              value={draft.socials.whatsappUrl}
              onChange={(e) => setSocial('whatsappUrl', e.target.value)}
              placeholder="https://wa.me/919876543210"
            />
          </Field>
          <Field label="Default greeting message" full>
            <textarea className="adm-textarea" value={draft.contact.whatsappMessage} onChange={(e) => setContact('whatsappMessage', e.target.value)} />
          </Field>
          <Field label="Booking CTA button text">
            <input className="adm-input" value={draft.contact.bookingCta} onChange={(e) => setContact('bookingCta', e.target.value)} />
          </Field>
          <Field label="Inquiry submit button text">
            <input className="adm-input" value={draft.contact.submitLabel} onChange={(e) => setContact('submitLabel', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Bottom bar & social links" desc="Instagram, YouTube and WhatsApp pills at the very bottom of every screen.">
        <div className="adm-grid3">
          <Field label="Instagram URL">
            <input className="adm-input" value={draft.socials.instagramUrl} onChange={(e) => setSocial('instagramUrl', e.target.value)} />
          </Field>
          <Field label="Instagram label">
            <input className="adm-input" value={draft.socials.instagramLabel} onChange={(e) => setSocial('instagramLabel', e.target.value)} />
          </Field>
          <Field label="Visibility">
            <Toggle checked={draft.socials.instagramEnabled} onChange={(v) => setSocial('instagramEnabled', v)} label="Show Instagram" />
          </Field>

          <Field label="YouTube URL">
            <input className="adm-input" value={draft.socials.youtubeUrl} onChange={(e) => setSocial('youtubeUrl', e.target.value)} />
          </Field>
          <Field label="YouTube label">
            <input className="adm-input" value={draft.socials.youtubeLabel} onChange={(e) => setSocial('youtubeLabel', e.target.value)} />
          </Field>
          <Field label="Visibility">
            <Toggle checked={draft.socials.youtubeEnabled} onChange={(v) => setSocial('youtubeEnabled', v)} label="Show YouTube" />
          </Field>

          <Field label="WhatsApp label">
            <input className="adm-input" value={draft.socials.whatsappLabel} onChange={(e) => setSocial('whatsappLabel', e.target.value)} />
          </Field>
          <Field label="Visibility">
            <Toggle checked={draft.socials.whatsappEnabled} onChange={(v) => setSocial('whatsappEnabled', v)} label="Show WhatsApp" />
          </Field>
          <Field label="Preview">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {links.map((l) => {
                const Icon = l.id === 'instagram' ? InstagramIcon : l.id === 'youtube' ? YouTubeIcon : WhatsAppIcon;
                return (
                  <span key={l.id} className="adm-pill live" style={{ gap: 4 }}>
                    <Icon className="w-2.5 h-2.5" /> {l.label}
                  </span>
                );
              })}
              {!links.length && <span className="adm-pill draft">bar hidden</span>}
            </div>
          </Field>
        </div>
      </Card>

      <Card title="Contact drawer copy" desc="Headline and intro shown in the services & contact panel.">
        <div className="adm-grid2">
          <Field label="Drawer heading" full>
            <input className="adm-input" value={draft.contact.drawerHeading} onChange={(e) => setContact('drawerHeading', e.target.value)} />
          </Field>
          <Field label="Drawer intro" full>
            <textarea className="adm-textarea" value={draft.contact.drawerIntro} onChange={(e) => setContact('drawerIntro', e.target.value)} />
          </Field>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="adm-btn ghost" onClick={() => setDraft(content)}>
          Discard changes
        </button>
        <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save contact details'}
        </button>
      </div>
    </>
  );
}
