import type { Project, SiteContent } from './types';

export const HX = (u: string) =>
  'https://images.higgs.ai/?default=1&output=webp&url=' + encodeURIComponent(u) + '&w=2048&q=85';

export const CF = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
export const R2 = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/aaaf/';

export const ASSETS = {
  plate: HX(CF + 'hf_20261111_001031_a09dc558-2c69-4e05-83a4-5f01ebdd1363.png'),
  casePlate: HX(CF + 'hf_20261111_001031_4a7c3fd9-2168-4219-9736-096a17bbb0e2.png'),
  cut: HX(CF + 'hf_20261111_001143_ec356b1a-50a2-4b50-82fc-e346c914a406.png'),
  badge:
    'https://images.higgs.ai/?default=1&output=webp&url=' +
    encodeURIComponent(CF + 'hf_20261111_001143_65c037e6-0768-4b12-9f17-17be132ce16b.png') +
    '&w=1200&q=85',
  trans: CF + 'hf_20261111_001144_2b054228-95af-41d5-922d-b02979fe485b.mp4',
  vell: R2 + 'vell-lookbook.mp4',
  vasari: R2 + 'vasari-vhs-hero.mp4',
  portrait: R2 + 'living-portrait-hero.mp4',
};

const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const gallery = (ids: string[], prefix: string, captions: string[] = []) =>
  ids.map((id, i) => ({
    id: `${prefix}-${i + 1}`,
    url: U(id, 1600),
    caption: captions[i] || '',
    width: 1600,
    height: 1067,
  }));

export const SERVICE_CATEGORIES = [
  'Wedding Cinematography',
  'Pre-Wedding Shots',
  'Aerial Videography',
  'Events & Concerts',
  'Real Estate & Commercial',
  'Cinematic Drone Shots',
  'Professional Drone Services',
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    wordmark: 'AB VISUALS',
    script: 'Professional Drone Services & Wedding Cinematography',
    scrollHint: 'SCROLL INTO THE WORK',
  },
  badge: {
    heading: 'DRONE PILOT\nID CARD',
    year: '2026',
    role: 'AERIAL DIRECTOR // CINEMATOGRAPHER',
    photoUrl: null,
    rows: [
      { label: 'AGENCY', value: 'AB VISUALS' },
      { label: 'FOCUS', value: 'DRONE & WEDDING CINEMA' },
      { label: 'INSTA', value: '{instagram}' },
      { label: 'CONTACT', value: '{phone}' },
    ],
  },
  nav: {
    studio: 'my studio',
    portfolio: 'portfolio',
    services: 'services & contact',
    book: 'book a shoot',
    logo: 'AB VISUALS',
  },
  labels: {
    ticketCta: 'VIEW FULL PROJECT (PHOTOS & VIDEO) ↗',
    screenPrompt: 'Click / Tap to Open Full Project',
    prev: 'previous\ncase',
    next: 'next\ncase',
    allProjectsHeading: 'ALL PROJECTS',
    showcaseEnquire: 'Enquire on WhatsApp',
    showcaseClose: 'Close',
  },
  services: [
    {
      id: 'svc-drone',
      title: 'Professional Drone Services',
      description:
        'DGCA-compliant pilots, cinema-grade drones and full aerial logistics for any production across India.',
      tag: 'AERIAL CREW',
    },
    {
      id: 'svc-wedding',
      title: 'Wedding Cinematography',
      description:
        'Multi-day wedding films blending sweeping aerial reveals with intimate, cinematic ground coverage.',
      tag: 'WEDDING FILMS',
    },
    {
      id: 'svc-prewedding',
      title: 'Pre-Wedding Shots',
      description:
        'Sunrise-to-sunset couple shoots in palaces, deserts and mountain valleys — aerial and handheld.',
      tag: 'COUPLES',
    },
    {
      id: 'svc-aerial',
      title: 'Aerial Videography',
      description:
        '4K / 6K aerial cinematography for brand films, travel features and destination tourism campaigns.',
      tag: '4K / 6K',
    },
    {
      id: 'svc-events',
      title: 'Events & Concerts',
      description:
        'FPV fly-throughs and multi-cam aerial coverage for concerts, festivals and live stadium shows.',
      tag: 'LIVE',
    },
    {
      id: 'svc-realestate',
      title: 'Real Estate & Commercial',
      description:
        'One-take exterior-to-interior property tours, gimbal work and architectural detail reels for developers.',
      tag: 'PROPERTY',
    },
    {
      id: 'svc-fpv',
      title: 'Cinematic Drone Shots',
      description:
        'Custom-built Cinewhoop FPV rigs for high-speed chase sequences, one-takes and impossible moves.',
      tag: 'FPV',
    },
  ],
  contact: {
    brandName: 'AB VISUALS',
    pilotName: 'Amit Kumar',
    phone: '+91 98765 43210',
    phoneAlt: '+91 91234 56789',
    whatsappNumber: '919876543210',
    whatsappMessage: 'Hi AB VISUALS, I would like to discuss a drone / wedding cinematography shoot.',
    email: 'hello@abvisuals.in',
    address: 'Patna, Bihar — shooting across India',
    availability: 'Available for travel nationwide · 2025 – 2026 dates open',
    instagramHandle: '@AB.VISUALS',
    drawerHeading: 'DRONE & WEDDING CINEMA',
    drawerIntro:
      'A boutique aerial and wedding film studio led by a certified drone pilot and cinematographer. We travel light, shoot cinematic, and deliver films built to be watched again.',
    bookingCta: 'BOOK A SHOOT',
    submitLabel: 'SEND INQUIRY ON WHATSAPP',
  },
  socials: {
    instagramUrl: 'https://instagram.com/ab.visuals',
    instagramLabel: '@ab.visuals',
    instagramEnabled: true,
    youtubeUrl: 'https://youtube.com/@abvisuals',
    youtubeLabel: 'YouTube',
    youtubeEnabled: true,
    whatsappUrl: 'https://wa.me/919876543210',
    whatsappLabel: 'WhatsApp',
    whatsappEnabled: true,
  },
};

const RAW_PROJECTS: Array<Partial<Project> & { title: string; slug: string }> = [
  {
    title: 'UDAIPUR ROYAL WEDDING',
    slug: 'udaipur-royal-wedding',
    category: 'Wedding Cinematography',
    location: 'Udaipur, India',
    year: '2026',
    ticket_rows: ['WEDDING CINEMA', 'AERIAL & GROUND', '2026'],
    short_key: '// udaipur royal wedding',
    short_desc:
      '— grand palace wedding captured with sweeping golden-hour drone reveals and intimate ground cinema.',
    full_description:
      'Three days, two palaces and one royal wedding. We opened the film with a golden-hour drone reveal over Lake Pichola, then followed the couple through mirrored courtyards and a candle-lit mandap. Aerial orbits, gimbal one-takes and candid ground cinema were woven into a single 12-minute wedding film plus six vertical reels for the family.',
    youtube_urls: ['https://www.youtube.com/watch?v=LXb3EKWsInQ'],
    preview_video_url: ASSETS.vell,
    cover_image_url: U('1519741497674-611481863552'),
    gallery_images: gallery(
      [
        '1519741497674-611481863552',
        '1511285560929-80b456fea0bc',
        '1519225421980-715cb0215aed',
        '1537633552985-df8429e8048b',
        '1465495976277-4387d4b0e4a6',
        '1583939003579-730e3918a45a',
        '1591604466107-ec97de577aff',
        '1606800052052-a08af7148866',
      ],
      'udaipur',
      [
        'Golden hour over the palace',
        'The first look',
        'Mandap florals',
        'Sangeet night',
        'Vidaai exit',
        'Couple portrait',
        'Courtyard walk',
        'Baraat drums',
      ]
    ),
    sort_order: 1,
  },
  {
    title: 'LADAKH PRE-WEDDING',
    slug: 'ladakh-pre-wedding',
    category: 'Pre-Wedding Shots',
    location: 'Leh & Pangong, India',
    year: '2026',
    ticket_rows: ['PRE-WEDDING', '4K AERIAL FILM', '2026'],
    short_key: '// ladakh pre-wedding',
    short_desc:
      '— high-altitude mountain valleys and Pangong lake aerial orbits framing a timeless love story.',
    full_description:
      'Shot across four days at 4,300 metres: Khardung La switchbacks at sunrise, a wind-swept Pangong Lake sequence, and a night-sky portrait under the Milky Way. Two drones, one gimbal and oxygen cans — the result is a pre-wedding film that feels like cinema.',
    youtube_urls: ['https://www.youtube.com/watch?v=aqz-KE-bpKQ'],
    preview_video_url: ASSETS.vasari,
    cover_image_url: U('1506905925346-21bda4d32df4'),
    gallery_images: gallery(
      [
        '1506905925346-21bda4d32df4',
        '1501785888041-af3ef285b470',
        '1476514525535-07fb3b4ae5f1',
        '1464822759023-fed622ff2c3b',
        '1454496522488-7a8e488e8606',
        '1519681393784-d120267933ba',
        '1483347756197-71ef80e95f73',
        '1464278533981-50106e6176b1',
      ],
      'ladakh',
      [
        'Pangong blue',
        'Valley overlook',
        'Lake road',
        'Himalayan ridge',
        'High pass',
        'Starlit ridge',
        'Couple at altitude',
        'Mountain haze',
      ]
    ),
    sort_order: 2,
  },
  {
    title: 'ARENA LIVE CONCERT',
    slug: 'arena-live-concert',
    category: 'Events & Concerts',
    location: 'Mumbai, India',
    year: '2026',
    ticket_rows: ['EVENTS & CONCERTS', 'FPV DRONE', '2026'],
    short_key: '// arena live concert',
    short_desc:
      '— dynamic Cinewhoop FPV fly-throughs over 25,000 fans, pyrotechnics, and main-stage energy.',
    full_description:
      'A three-camera aerial team covering a sold-out arena show: FPV Cinewhoop passes through the stage arch, a heavy-lift cinema drone for the crowd waves, and a pilot on the rail for pyro timing. Delivered same-night highlight reels for the artist and the promoter.',
    youtube_urls: [
      'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      'https://youtu.be/aqz-KE-bpKQ',
    ],
    preview_video_url: ASSETS.portrait,
    cover_image_url: U('1470229722913-7c0e2dbbafd3'),
    gallery_images: gallery(
      [
        '1470229722913-7c0e2dbbafd3',
        '1464366400600-7168b8af9bc3',
        '1501386761578-eac5c94b800a',
        '1493225457124-a3eb161ffa5f',
        '1459749411175-04bf5292ceea',
        '1524368535928-5b5e00ddc76b',
        '1540039155733-5bb30b53aa14',
        '1516450360452-9312f5e86fc7',
      ],
      'concert',
      [
        'Main stage open',
        'Crowd surge',
        'Front row lights',
        'Hands up',
        'Spotlight solo',
        'Stage haze',
        'Festival night',
        'Encore',
      ]
    ),
    sort_order: 3,
  },
  {
    title: 'SKYLINE LUXURY VILLAS',
    slug: 'skyline-luxury-villas',
    category: 'Real Estate & Commercial',
    location: 'Goa, India',
    year: '2026',
    ticket_rows: ['REAL ESTATE', 'COMMERCIAL SHOOT', '2026'],
    short_key: '// skyline luxury villas',
    short_desc:
      '— architectural exterior-to-interior one-take drone tour showcasing luxury waterfront residences.',
    full_description:
      'A property film for a waterfront villa collection: an exterior-to-interior one-take that starts 120 metres over the bay, dives through the pool deck and hands off to a gimbal operator walking the living room. Delivered in 16:9, 9:16 and 1:1 for developer campaigns.',
    youtube_urls: ['https://www.youtube.com/watch?v=aqz-KE-bpKQ'],
    preview_video_url: null,
    cover_image_url: U('1600585154340-be6161a56a0c'),
    gallery_images: gallery(
      [
        '1600585154340-be6161a56a0c',
        '1613490493576-7fde63acd811',
        '1600607687939-ce8a6c25118c',
        '1600566753086-00f18fb6b3ea',
        '1600596542815-ffad4c1539a9',
        '1512917774080-9991f1c4c750',
        '1580587771525-78b9dba3b914',
        '1600047509807-ba8f99d2cdde',
      ],
      'villas',
      [
        'Poolside elevation',
        'Waterfront facade',
        'Living volume',
        'Interior detail',
        'Evening exterior',
        'Approach drive',
        'Bay view deck',
        'Master suite',
      ]
    ),
    sort_order: 4,
  },
  {
    title: 'COASTAL FPV CHASE',
    slug: 'coastal-fpv-chase',
    category: 'Cinematic Drone Shots',
    location: 'Konkan Coast, India',
    year: '2026',
    ticket_rows: ['CINEMATIC DRONE', 'HIGH-SPEED REEL', '2026'],
    short_key: '// coastal fpv chase',
    short_desc:
      '— precision 120km/h custom FPV chase sequences hugging cliffside roads and ocean waves.',
    full_description:
      'A pure adrenaline reel: custom 5-inch FPV rigs chasing a car down cliffside hairpins, threading between palms and skimming six feet over the surf. Built as a spec piece that became our most-shared aerial reel of the year.',
    youtube_urls: ['https://www.youtube.com/watch?v=LXb3EKWsInQ'],
    preview_video_url: ASSETS.vell,
    cover_image_url: U('1500375592092-40eb2168fd21'),
    gallery_images: gallery(
      [
        '1500375592092-40eb2168fd21',
        '1507525428034-b723cf961d3e',
        '1519046904884-53103b34b206',
        '1510414842594-a61c69b5ae57',
        '1498623116890-37e912163d5d',
        '1473116763249-2faaef81ccda',
        '1505142468610-359e7d316be0',
        '1439405326854-014607f694d7',
      ],
      'coast',
      [
        'Surf line',
        'Empty beach',
        'Coast road',
        'Cliff edge',
        'Hairpin',
        'Wave break',
        'Blue hour ocean',
        'Shoreline',
      ]
    ),
    sort_order: 5,
  },
  {
    title: 'HERITAGE RESORT FILM',
    slug: 'heritage-resort-film',
    category: 'Aerial Videography',
    location: 'Jaipur, India',
    year: '2025',
    ticket_rows: ['AERIAL VIDEOGRAPHY', 'BRAND FILM', '2025'],
    short_key: '// heritage resort film',
    short_desc:
      '— sunrise mist aerials and cinematic hospitality storytelling crafted for luxury tourism.',
    full_description:
      'A brand film for a heritage property: sunrise aerials through low mist, slow reveal of the courtyard haveli, and a guest-journey narrative shot entirely in natural light. Delivered with a 60s master, three 15s cutdowns and a photo library for the booking site.',
    youtube_urls: ['https://www.youtube.com/watch?v=aqz-KE-bpKQ'],
    preview_video_url: ASSETS.vasari,
    cover_image_url: U('1540541338287-41700207dee6'),
    gallery_images: gallery(
      [
        '1540541338287-41700207dee6',
        '1520250497591-112f2f40a3f4',
        '1571896349842-33c89424de2d',
        '1566073771259-6a8506099945',
        '1582719508461-905c673771fd',
        '1445019980597-93fa8acb246c',
        '1618773928121-c32242e63f39',
        '1542314831-068cd1dbfeeb',
      ],
      'resort',
      [
        'Sunrise pool',
        'Courtyard',
        'Suite interior',
        'Resort gardens',
        'Lounge terrace',
        'Colonial corridor',
        'Heritage room',
        'Evening lamps',
      ]
    ),
    sort_order: 6,
  },
];

export const DEFAULT_PROJECTS: Project[] = RAW_PROJECTS.map((p, i) => ({
  id: `seed-${p.slug}`,
  title: p.title,
  slug: p.slug,
  category: p.category || 'Wedding Cinematography',
  location: p.location || 'India',
  year: p.year || '2026',
  ticket_rows: p.ticket_rows || [],
  short_key: p.short_key || '',
  short_desc: p.short_desc || '',
  full_description: p.full_description || '',
  youtube_urls: p.youtube_urls || [],
  preview_video_url: p.preview_video_url ?? null,
  cover_image_url: p.cover_image_url || '',
  gallery_images: p.gallery_images || [],
  sort_order: p.sort_order ?? i + 1,
  is_published: true,
  created_at: new Date(2026, 0, i + 1).toISOString(),
}));

export const DEFAULT_ADMIN_PASSCODE = 'amit231106';

export const SUPABASE_SQL = `-- AB VISUALS · Supabase schema (run once in SQL Editor)
create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id text primary key,
  title text not null,
  slug text,
  category text,
  location text,
  year text,
  ticket_rows jsonb default '[]'::jsonb,
  short_key text,
  short_desc text,
  full_description text,
  youtube_urls jsonb default '[]'::jsonb,
  preview_video_url text,
  cover_image_url text,
  gallery_images jsonb default '[]'::jsonb,
  sort_order int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  shoot_type text,
  shoot_date text,
  location text,
  message text,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
alter table public.site_content enable row level security;
alter table public.inquiries enable row level security;

-- Public site reads
create policy "projects read" on public.projects for select using (true);
create policy "site read" on public.site_content for select using (true);

-- Admin writes (client-side CMS; keep the passcode private)
create policy "projects write" on public.projects for all using (true) with check (true);
create policy "site write" on public.site_content for all using (true) with check (true);
create policy "inquiries insert" on public.inquiries for insert with check (true);
create policy "inquiries read" on public.inquiries for select using (true);

-- Public media bucket
insert into storage.buckets (id, name, public)
values ('ab-visuals-media', 'ab-visuals-media', true)
on conflict (id) do update set public = true;

create policy "media read" on storage.objects for select
  using (bucket_id = 'ab-visuals-media');
create policy "media write" on storage.objects for insert
  with check (bucket_id = 'ab-visuals-media');
create policy "media update" on storage.objects for update
  using (bucket_id = 'ab-visuals-media');
create policy "media delete" on storage.objects for delete
  using (bucket_id = 'ab-visuals-media');
`;
