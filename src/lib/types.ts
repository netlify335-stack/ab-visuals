export type GalleryImage = {
  id: string;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  year: string;
  ticket_rows: string[];
  short_key: string;
  short_desc: string;
  full_description: string;
  youtube_urls: string[];
  preview_video_url?: string | null;
  cover_image_url: string;
  gallery_images: GalleryImage[];
  sort_order: number;
  is_published: boolean;
  created_at?: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
};

export type BadgeRow = { label: string; value: string };

export type SiteContent = {
  hero: {
    wordmark: string;
    script: string;
    scrollHint: string;
  };
  badge: {
    heading: string;
    year: string;
    role: string;
    photoUrl?: string | null;
    rows: BadgeRow[];
  };
  nav: {
    studio: string;
    portfolio: string;
    services: string;
    book: string;
    logo: string;
  };
  labels: {
    ticketCta: string;
    screenPrompt: string;
    prev: string;
    next: string;
    allProjectsHeading: string;
    showcaseEnquire: string;
    showcaseClose: string;
  };
  services: ServiceItem[];
  contact: {
    brandName: string;
    pilotName: string;
    phone: string;
    phoneAlt: string;
    whatsappNumber: string;
    whatsappMessage: string;
    email: string;
    address: string;
    availability: string;
    instagramHandle: string;
    drawerHeading: string;
    drawerIntro: string;
    bookingCta: string;
    submitLabel: string;
  };
  socials: {
    instagramUrl: string;
    instagramLabel: string;
    instagramEnabled: boolean;
    youtubeUrl: string;
    youtubeLabel: string;
    youtubeEnabled: boolean;
    whatsappUrl: string;
    whatsappLabel: string;
    whatsappEnabled: boolean;
  };
};

export type Inquiry = {
  id?: string;
  name: string;
  phone: string;
  shoot_type: string;
  shoot_date: string;
  location: string;
  message: string;
  created_at?: string;
};

export type AdminCreds = {
  hash: string;
};

export type StoreMode = 'cloud' | 'local';

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};
