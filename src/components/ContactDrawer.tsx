import { useEffect } from 'react';
import { socialsList, waLink } from '../lib/format';
import type { SiteContent } from '../lib/types';
import InquiryForm from './InquiryForm';
import {
  CloseIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from './Icons';

const ICONS = { instagram: InstagramIcon, youtube: YouTubeIcon, whatsapp: WhatsAppIcon };

export default function ContactDrawer({ cms, onClose }: { cms: SiteContent; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const socials = socialsList(cms);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Services and contact" onClick={onClose}>
      <div className="sheet contact-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="eyebrow" style={{ color: 'var(--mint)', fontSize: 10 }}>{cms.contact.brandName} · STUDIO</div>
            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(24px, 3.4vw, 34px)', textTransform: 'uppercase', marginTop: 4 }}>
              {cms.contact.drawerHeading}
            </h2>
            <p style={{ margin: '8px 0 0', maxWidth: 520, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,.6)' }}>
              {cms.contact.drawerIntro}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close services and contact">
            <CloseIcon />
          </button>
        </div>

        <div className="contact-body">
          <div>
            <div className="sc-section-title" style={{ margin: '0 0 10px' }}>
              <h3 style={{ fontSize: 18 }}>Services</h3>
              <span>{cms.services.length} offerings</span>
            </div>
            <div className="services-grid">
              {cms.services.map((s) => (
                <div key={s.id} className="service-card">
                  <div className="tagline">{s.tag}</div>
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                </div>
              ))}
            </div>

            <div className="sc-section-title" style={{ margin: '22px 0 0' }}>
              <h3 style={{ fontSize: 18 }}>Contact</h3>
              <span>{cms.contact.availability}</span>
            </div>
            <div className="contact-lines">
              <a className="contact-line" href={`tel:${cms.contact.phone.replace(/\s/g, '')}`}>
                <PhoneIcon />
                <span className="k">Call</span>
                <span className="v">{cms.contact.phone}</span>
              </a>
              {cms.contact.phoneAlt ? (
                <a className="contact-line" href={`tel:${cms.contact.phoneAlt.replace(/\s/g, '')}`}>
                  <PhoneIcon />
                  <span className="k">Alt</span>
                  <span className="v">{cms.contact.phoneAlt}</span>
                </a>
              ) : null}
              <a className="contact-line" href={`mailto:${cms.contact.email}`}>
                <MailIcon />
                <span className="k">Email</span>
                <span className="v">{cms.contact.email}</span>
              </a>
              <div className="contact-line" style={{ cursor: 'default' }}>
                <PinIcon />
                <span className="k">Studio</span>
                <span className="v">{cms.contact.address}</span>
              </div>
            </div>

            <div className="social-cards">
              {socials.map((s) => {
                const Icon = ICONS[s.id];
                return (
                  <a key={s.id} className="social-card" href={s.url} target="_blank" rel="noopener noreferrer">
                    <Icon className="w-4 h-4" />
                    {s.label}
                    <span>{s.id === 'whatsapp' ? 'Direct chat' : s.id === 'youtube' ? 'Film channel' : 'Behind the scenes'}</span>
                  </a>
                );
              })}
            </div>

            <a
              className="btn btn-wa"
              style={{ width: '100%', marginTop: 14 }}
              href={waLink(cms.contact.whatsappNumber, cms.contact.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>

          <div>
            <div className="sc-section-title" style={{ margin: '0 0 10px' }}>
              <h3 style={{ fontSize: 18 }}>Shoot Inquiry</h3>
              <span>Reply within 24h</span>
            </div>
            <InquiryForm cms={cms} />
          </div>
        </div>
      </div>
    </div>
  );
}
