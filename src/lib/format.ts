import type { SyntheticEvent } from 'react';
import type { SiteContent } from './types';

export const digitsOnly = (s: string) => (s || '').replace(/[^\d]/g, '');

export function waLink(number: string, message: string) {
  const num = digitsOnly(number);
  return `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function ensureUrl(url: string): string {
  if (!url) return '';
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (/^\+?[\d\s-]{7,}$/.test(url)) return waLink(url, '');
  return `https://${url}`;
}

export function socialsList(cms: SiteContent) {
  const s = cms.socials;
  return [
    {
      id: 'instagram' as const,
      enabled: s.instagramEnabled,
      url: ensureUrl(s.instagramUrl),
      label: s.instagramLabel || 'Instagram',
    },
    {
      id: 'youtube' as const,
      enabled: s.youtubeEnabled,
      url: ensureUrl(s.youtubeUrl),
      label: s.youtubeLabel || 'YouTube',
    },
    {
      id: 'whatsapp' as const,
      enabled: s.whatsappEnabled,
      url: s.whatsappUrl ? ensureUrl(s.whatsappUrl) : waLink(cms.contact.whatsappNumber, ''),
      label: s.whatsappLabel || 'WhatsApp',
    },
  ].filter((l) => l.enabled && l.url);
}

/** Resolve %TOKENS% used in the lanyard badge rows against live contact settings. */
export function resolveBadgeValue(value: string, cms: SiteContent) {
  return value.replace(/\{(\w+)\}/g, (m, key: string) => {
    switch (key) {
      case 'instagram':
        return cms.contact.instagramHandle;
      case 'phone':
        return cms.contact.phone;
      case 'phoneAlt':
        return cms.contact.phoneAlt;
      case 'email':
        return cms.contact.email;
      case 'brand':
        return cms.contact.brandName;
      case 'whatsapp':
        return cms.contact.whatsappNumber;
      default:
        return m;
    }
  });
}

export const slugify = (s: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const uid = () =>
  (crypto as Crypto).randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const IMG_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#164b37"/><stop offset="1" stop-color="#0a241a"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="410" font-family="Helvetica,Arial,sans-serif" font-size="46" font-weight="bold" fill="rgba(255,255,255,.28)" text-anchor="middle" letter-spacing="6">AB VISUALS</text></svg>'
  );

export const imgFallback = (e: SyntheticEvent<HTMLImageElement>) => {
  const el = e.currentTarget;
  if (el.dataset.fallback) return;
  el.dataset.fallback = '1';
  el.src = IMG_FALLBACK;
};
