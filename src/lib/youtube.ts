const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Parse any common YouTube URL shape into an 11-char video id. */
export function parseYouTubeId(input: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (ID_RE.test(raw)) return raw;
  let url: URL;
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1] || '';
    return ID_RE.test(id) ? id : null;
  }
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const v = url.searchParams.get('v');
    if (v && ID_RE.test(v)) return v;
    const parts = url.pathname.split('/').filter(Boolean);
    const keyed = parts.findIndex((p) => ['embed', 'shorts', 'v', 'live'].includes(p));
    if (keyed >= 0 && parts[keyed + 1] && ID_RE.test(parts[keyed + 1])) return parts[keyed + 1];
    if (parts[0] === 'watch' && parts[1]) {
      const candidate = parts[1].replace('v/', '');
      if (ID_RE.test(candidate)) return candidate;
    }
  }
  return null;
}

export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;

export const youtubePreviewUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?controls=0&mute=1&autoplay=1&loop=1&playlist=${id}&modestbranding=1&rel=0&playsinline=1&disablekb=1`;

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
