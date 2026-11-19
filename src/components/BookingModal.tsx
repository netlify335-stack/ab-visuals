import { useEffect } from 'react';
import type { SiteContent } from '../lib/types';
import InquiryForm from './InquiryForm';
import { CloseIcon } from './Icons';

export default function BookingModal({ cms, onClose }: { cms: SiteContent; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay center" role="dialog" aria-modal="true" aria-label="Book a shoot" onClick={onClose}>
      <div className="sheet booking-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="eyebrow" style={{ color: 'var(--mint)', fontSize: 10 }}>QUICK BOOKING</div>
            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 27, textTransform: 'uppercase', marginTop: 4 }}>
              {cms.contact.bookingCta}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>
              Tell us the dates — we reply on WhatsApp with availability &amp; packages.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close booking">
            <CloseIcon />
          </button>
        </div>
        <div className="sheet-body">
          <InquiryForm cms={cms} />
        </div>
      </div>
    </div>
  );
}
