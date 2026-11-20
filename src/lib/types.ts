export interface GalleryImage {
  id: string
  url: string
  caption?: string
  width?: number
  height?: number
}

export interface Project {
  id: string
  title: string
  slug: string
  category: string
  location: string
  year: string
  /** 3 metadata lines shown on the punched ticket card */
  ticket_rows: string[]
  short_key: string
  short_desc: string
  full_description: string
  youtube_urls: string[]
  preview_video_url?: string
  cover_image_url: string
  gallery_images: GalleryImage[]
  sort_order: number
  is_published: boolean
  created_at: string
}

export interface BadgeRow {
  label: string
  value: string
}

export interface SiteContent {
  hero: {
    wordmark: string
    script: string
    scrollHint: string
  }
  badge: {
    heading: string
    year: string
    role: string
    /** custom pilot portrait uploaded from gallery; '' = default studio cutout */
    photoUrl: string
    rows: BadgeRow[]
  }
  nav: {
    studio: string
    portfolio: string
    services: string
    book: string
    caseLogo: string
  }
  ticket: {
    viewFull: string
    browseAll: string
    prevLabel: string
    nextLabel: string
    screenCue: string
    allProjectsHeading: string
  }
  contact: {
    name: string
    phone: string
    whatsappNumber: string
    whatsappGreeting: string
    email: string
    city: string
    instagramHandle: string
    phoneOrEmailShort: string
    availability: string
  }
  socials: {
    instagramUrl: string
    instagramLabel: string
    instagramShow: boolean
    youtubeUrl: string
    youtubeLabel: string
    youtubeShow: boolean
    whatsappUrl: string
    whatsappLabel: string
    whatsappShow: boolean
  }
  services: ServiceItem[]
  drawer: {
    heading: string
    subheading: string
    ctaText: string
  }
}

export interface ServiceItem {
  id: string
  title: string
  desc: string
  tag: string
}

export interface Inquiry {
  id?: string
  name: string
  type: string
  date: string
  location: string
  message: string
  created_at?: string
}

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36))

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project'
