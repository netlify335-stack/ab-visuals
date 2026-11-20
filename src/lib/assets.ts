/** Central asset URLs for the studio scene. Do not crop / re-encode cloudfront plates. */
export const HX = (u: string, w = 2048) =>
  'https://images.higgs.ai/?default=1&output=webp&url=' + encodeURIComponent(u) + `&w=${w}&q=85`

const CF = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/'

/** Hero photo 3:2 — subject in deep-green studio, no text. */
export const PLATE = HX(CF + 'hf_20261111_001031_a09dc558-2c69-4e05-83a4-5f01ebdd1363.png')
/** Case photo 3:2 — silver laptop dead-centre, square to camera. */
export const CASE_PLATE = HX(CF + 'hf_20261111_001031_4a7c3fd9-2168-4219-9736-096a17bbb0e2.png')
/** Transparent cutout of the man only, pixel aligned with PLATE. */
export const CUT = HX(CF + 'hf_20261111_001143_ec356b1a-50a2-4b50-82fc-e346c914a406.png')
/** Transparent lanyard + ID sleeve with blank white card. */
export const BADGE =
  'https://images.higgs.ai/?default=1&output=webp&url=' +
  encodeURIComponent(CF + 'hf_20261111_001143_65c037e6-0768-4b12-9f17-17be132ce16b.png') +
  '&w=1200&q=85'
/** 1280x720 24fps 5.04s dive transition (NOT wrapped). */
export const TRANS = CF + 'hf_20261111_001144_2b054228-95af-41d5-922d-b02979fe485b.mp4'

export const R2 = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/aaaf/'
export const PREVIEW_VIDEOS = {
  vell: R2 + 'vell-lookbook.mp4',
  vasari: R2 + 'vasari-vhs-hero.mp4',
  living: R2 + 'living-portrait-hero.mp4',
}

/** Unsplash high-res photo helper. */
export const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/** Guaranteed-resolution fallback used by <img onerror>. */
export const FALLBACK = (seed: number | string, w = 1600, h = 1100) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${w}/${h}`
