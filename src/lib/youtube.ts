/** Parse any YouTube URL format into an 11-char video id. */
export function ytId(url: string): string | null {
  const s = (url || '').trim()
  if (!s) return null
  const m = s.match(
    /(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  if (m) return m[1]
  const bare = s.match(/^([A-Za-z0-9_-]{11})$/)
  return bare ? bare[1] : null
}

/** Clean muted autoplay loop preview for the laptop screen. */
export function ytPreviewEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?controls=0&mute=1&autoplay=1&loop=1&playlist=${id}&modestbranding=1&rel=0&playsinline=1`
}

/** HD inline cinema player with sound + fullscreen controls. */
export function ytCinemaEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1`
}

export function isYoutube(url: string): boolean {
  return ytId(url) !== null
}
