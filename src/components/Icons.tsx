import type { CSSProperties } from 'react';

type P = { className?: string; style?: CSSProperties };

export const InstagramIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
  </svg>
);

export const YouTubeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2.2" y="5.4" width="19.6" height="13.2" rx="4" fill="currentColor" opacity="0.22" />
    <rect x="2.2" y="5.4" width="19.6" height="13.2" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M10.2 9.3L15.4 12L10.2 14.7V9.3Z" fill="currentColor" />
  </svg>
);

export const WhatsAppIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12.03 2.8c-5.1 0-9.23 4.12-9.23 9.2 0 1.62.43 3.2 1.24 4.6L2.8 21.2l4.74-1.22a9.26 9.26 0 0 0 4.49 1.14c5.1 0 9.23-4.12 9.23-9.2 0-5.1-4.13-9.22-9.23-9.22Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 7.7c.28-.02.55.02.74.44l.72 1.7c.1.24.05.42-.12.62l-.48.56c-.14.16-.16.3-.07.47.42.78 1.6 1.97 2.42 2.4.2.1.35.08.5-.09l.53-.6c.18-.2.36-.24.6-.13l1.7.8c.3.15.36.36.36.6 0 .8-.6 1.6-1.3 1.75-.55.12-1.3.05-2.2-.35-1.9-.85-3.6-2.6-4.3-4.4-.36-.94-.35-1.7-.2-2.2.2-.65.87-1.12 1.5-1.14Z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 12h15M13 5.5L19.5 12 13 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowLeft = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M20 12H5M11 5.5L4.5 12 11 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowUpRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M7 17L17 7M17 7H8.5M17 7v8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const PlayIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
  </svg>
);

export const PhoneIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M6.6 3.8h2.2l1.5 3.9-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 3.9 1.5v2.2c0 1.4-1.2 2.4-2.6 2.2C10.3 18.2 5.8 13.7 4.4 6.4c-.2-1.4.8-2.6 2.2-2.6Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const MailIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const PinIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const GridIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const ImageIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="8.6" cy="9.6" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 17l4.6-4.4 3.2 3 3-2.6L20 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ZoomIcon = ({ className, out }: P & { out?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M15.4 15.4L20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M7.6 10.5h5.8M10.5 7.6v5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ display: out ? 'none' : undefined }} />
    <path d="M7.6 10.5h5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ display: out ? undefined : 'none' }} />
  </svg>
);

export const PlusIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TrashIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 7h15M9.5 7V5.2c0-.7.6-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7M6.5 7l.8 12.2c.05.8.7 1.3 1.5 1.3h6.4c.8 0 1.45-.5 1.5-1.3L17.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronUp = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDown = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 12.5l5 5 10-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4.5" y="10.2" width="15" height="10.3" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8.2 10.2V7.6a3.8 3.8 0 0 1 7.6 0v2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const SparkIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
