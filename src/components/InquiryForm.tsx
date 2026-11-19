import { useState } from 'react';
import { addInquiry } from '../lib/store';
import { waLink } from '../lib/format';
import type { SiteContent } from '../lib/types';
import { CheckIcon, WhatsAppIcon } from './Icons';

type Props = {
  cms: SiteContent;
  title?: string;
  onSent?: () => void;
};

const EXTRA_TYPES = ['Drone Rental / Pilot', 'Other'];

export default function InquiryForm({ cms, title, onSent }: Props) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    shoot_type: cms.services[0]?.title || 'Wedding Cinematography',
    shoot_date: '',
    location: '',
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please add your name and phone / WhatsApp number.');
      return;
    }
    setError(null);
    const lines = [
      `Hi ${cms.contact.brandName}, I'd like to book a shoot.`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Shoot type: ${form.shoot_type}`,
      form.shoot_date ? `Date: ${form.shoot_date}` : '',
      form.location ? `Location: ${form.location}` : '',
      form.message ? `Message: ${form.message}` : '',
    ].filter(Boolean);
    const text = `${cms.contact.whatsappMessage}\n\n${lines.join('\n')}`;
    const link = waLink(cms.contact.whatsappNumber, text);
    window.open(link, '_blank', 'noopener,noreferrer');
    try {
      await addInquiry(form);
    } catch {
      /* lead log is best effort — the WhatsApp message is the source of truth */
    }
    setSent(true);
    onSent?.();
  };

  const options = [...cms.services.map((s) => s.title), ...EXTRA_TYPES];

  return (
    <form onSubmit={submit}>
      {title ? (
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>{title}</h3>
      ) : null}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="inq-name">Your name</label>
          <input id="inq-name" className="input" value={form.name} onChange={set('name')} placeholder="Aarav &amp; Meera" />
        </div>
        <div className="field">
          <label htmlFor="inq-phone">Phone / WhatsApp</label>
          <input id="inq-phone" className="input" value={form.phone} onChange={set('phone')} placeholder="+91 …" inputMode="tel" />
        </div>
        <div className="field">
          <label htmlFor="inq-type">Shoot type</label>
          <select id="inq-type" className="select" value={form.shoot_type} onChange={set('shoot_type')}>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="inq-date">Shoot date</label>
          <input id="inq-date" className="input" type="date" value={form.shoot_date} onChange={set('shoot_date')} />
        </div>
        <div className="field full">
          <label htmlFor="inq-loc">Location / venue</label>
          <input id="inq-loc" className="input" value={form.location} onChange={set('location')} placeholder="City, venue or destination" />
        </div>
        <div className="field full">
          <label htmlFor="inq-msg">Tell us about the shoot</label>
          <textarea id="inq-msg" className="textarea" value={form.message} onChange={set('message')} placeholder="Days, deliverables, references…" />
        </div>
      </div>
      {error ? <div className="adm-error" style={{ marginTop: 10 }}>{error}</div> : null}
      <button type="submit" className="btn btn-wa" style={{ width: '100%', marginTop: 14 }}>
        <WhatsAppIcon className="w-4 h-4" /> {cms.contact.submitLabel}
      </button>
      {sent ? (
        <div className="form-success">
          <CheckIcon className="w-4 h-4" /> Inquiry prepared — send it in WhatsApp to confirm your date.
        </div>
      ) : (
        <p className="form-note">
          Opens WhatsApp with your details pre-filled and also logs the lead inside the studio admin. Prefer calling?{' '}
          <a href={`tel:${cms.contact.phone.replace(/\s/g, '')}`} style={{ color: 'var(--mint)', fontWeight: 600 }}>
            {cms.contact.phone}
          </a>
        </p>
      )}
    </form>
  );
}
