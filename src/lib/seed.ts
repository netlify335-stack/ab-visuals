import { Project, SiteContent, GalleryImage, uid as mkid } from './types'
import { U, PREVIEW_VIDEOS } from './assets'

const g = (ids: [string, string?][], seedBase: number): GalleryImage[] =>
  ids.map(([id, caption], i) => ({
    id: mkid(),
    url: U(id, 1800),
    caption: caption || '',
    width: 1800,
    height: 1200,
  }))

const seedBase = 100

export function seedProjects(): Project[] {
  const rows: Array<Partial<Project> & Pick<Project, 'title' | 'category' | 'ticket_rows' | 'short_key' | 'short_desc'>> = [
    {
      title: 'UDAIPUR ROYAL WEDDING',
      category: 'Wedding Cinematography',
      location: 'Udaipur, Rajasthan',
      year: '2026',
      ticket_rows: ['WEDDING CINEMA', 'AERIAL & GROUND', '2026'],
      short_key: '// udaipur royal wedding',
      short_desc:
        '— grand palace wedding captured with sweeping golden-hour drone reveals and intimate ground cinema.',
      full_description:
        'A three-day royal celebration at a lakeside palace in Udaipur. Our crew paired a cinematic ground unit with a golden-hour drone reveal, orbiting the baraat route, the mandap on the water, and the fireworks finale. The final film cuts candid ground moments with sweeping aerials for a true destination-wedding feature.',
      preview_video_url: PREVIEW_VIDEOS.vell,
      youtube_urls: ['https://www.youtube.com/watch?v=yT89nFagXUs'],
      gallery_images: g(
        [
          ['photo-1519741497674-611481863552', 'Baraat arrival, palace courtyard'],
          ['photo-1511285560929-80b456fea0bc', 'First look by the lake'],
          ['photo-1522673607200-164d1b6ce486', 'Ring ceremony detail'],
          ['photo-1583939003579-730e3918a45a', 'Golden hour portrait'],
          ['photo-1465495976277-4387d4b0b4c6', 'Sparkler send-off'],
          ['photo-1520854221256-17451cc331bf', 'The bride'],
          ['photo-1529634806980-85c3dd6b3183', 'Palace corridors'],
          ['photo-1519225421980-715cb0215aed', 'Reception tablescape'],
        ],
        seedBase + 1,
      ),
    },
    {
      title: 'LADAKH PRE-WEDDING',
      category: 'Pre-Wedding Shots',
      location: 'Ladakh, India',
      year: '2026',
      ticket_rows: ['PRE-WEDDING', '4K AERIAL FILM', '2026'],
      short_key: '// ladakh pre-wedding',
      short_desc:
        '— high-altitude mountain valleys and Pangong lake aerial orbits framing a timeless love story.',
      full_description:
        'Shot at 3,500 metres across Nubra valley, Pangong Tso and magnetic hill. Thin air and 40 km/h winds demanded a lightweight Cinewhoop and a patient ground unit. The result is a 4K pre-wedding film built from sunrise orbits, prayer-flag passes and long-lens valley portraits.',
      preview_video_url: PREVIEW_VIDEOS.living,
      youtube_urls: ['https://www.youtube.com/watch?v=GjwGXTwjp_U'],
      gallery_images: g(
        [
          ['photo-1506905925346-21bda4d32df4', 'Nubra valley ridgeline'],
          ['photo-1464822759023-fed622ff2c3b', 'High passes at first light'],
          ['photo-1493246507139-91e8fad9978e', 'Alpine lake mirror'],
          ['photo-1470071459604-3b5ec3a7fe05', 'Valley mist, morning'],
          ['photo-1500530855697-b586d89ba3ee', 'Road to Pangong'],
          ['photo-1469474968028-56623f02e42e', 'Golden hour over the range'],
        ],
        seedBase + 2,
      ),
    },
    {
      title: 'ARENA LIVE CONCERT',
      category: 'Events & Concerts',
      location: 'Bengaluru, India',
      year: '2026',
      ticket_rows: ['EVENTS & CONCERTS', 'FPV DRONE', '2026'],
      short_key: '// arena live concert',
      short_desc:
        '— dynamic Cinewhoop FPV fly-throughs over 25,000 fans, pyrotechnics, and main-stage energy.',
      full_description:
        'A sold-out arena show covered with a five-camera stage unit plus a custom Cinewhoop FPV rig flying low over the crowd and through the stage trusses. Pyro-safe flight planning and RF coordination kept the drone airborne for all three encores. The aftermovie cut is built entirely from the FPV perspective.',
      preview_video_url: PREVIEW_VIDEOS.vasari,
      youtube_urls: [],
      gallery_images: g(
        [
          ['photo-1470229722913-7c0e2dbbafd3', 'Main stage, opener'],
          ['photo-1501281668745-f7f57925c3b4', '25,000 voices'],
          ['photo-1514525253161-7a46d19cd819', 'Lights over the pit'],
          ['photo-1459749411175-04bf5292ceea', 'Crowd surge, chorus'],
          ['photo-1470225620780-dba8ba36b745', 'DJ close-up'],
          ['photo-1429962714451-bb934ecdc4ec', 'Laser sweep'],
        ],
        seedBase + 3,
      ),
    },
    {
      title: 'SKYLINE LUXURY VILLAS',
      category: 'Real Estate & Commercial',
      location: 'Goa, India',
      year: '2026',
      ticket_rows: ['REAL ESTATE', 'COMMERCIAL SHOOT', '2026'],
      short_key: '// skyline luxury villas',
      short_desc:
        '— architectural exterior-to-interior one-take drone tour showcasing luxury waterfront residences.',
      full_description:
        'A waterfront villa development launch film. The hero shot is a single continuous move: rising from the infinity pool deck, sliding through the living room, and revealing the creek view from the master balcony. Supported by twilight exteriors, aerial amenity passes and a 60-second social cutdown.',
      preview_video_url: PREVIEW_VIDEOS.vell,
      youtube_urls: [],
      gallery_images: g(
        [
          ['photo-1600596542815-ffad4c1539a9', 'Villa elevation, dusk'],
          ['photo-1600585154340-be6161a56a0c', 'Living room reveal'],
          ['photo-1512917774080-9991f1c4c750', 'Infinity pool'],
          ['photo-1564013799919-ab600027ffc6', 'Street-front facade'],
          ['photo-1600607687939-ce8a6c25118c', 'Interior detail'],
          ['photo-1600566753086-00f18fb6b3ea', 'Master suite'],
        ],
        seedBase + 4,
      ),
    },
    {
      title: 'COASTAL FPV CHASE',
      category: 'Cinematic Drone Shots',
      location: 'Vizag, Andhra Pradesh',
      year: '2026',
      ticket_rows: ['CINEMATIC DRONE', 'HIGH-SPEED REEL', '2026'],
      short_key: '// coastal fpv chase',
      short_desc:
        '— precision 120km/h custom FPV chase sequences hugging cliffside roads and ocean waves.',
      full_description:
        'A high-speed brand reel shot along the Vizag coastline. A custom 5-inch FPV rig chased vehicles at 120 km/h through cliffside switchbacks, dove the wave line at six feet, and threaded rock arches. Every pass was storyboarded against tide charts and wind windows for repeatable, safe takes.',
      preview_video_url: PREVIEW_VIDEOS.vasari,
      youtube_urls: ['https://www.youtube.com/watch?v=jRs-2hty6XQ'],
      gallery_images: g(
        [
          ['photo-1507525428034-b723cf961d3e', 'Cliffside shoreline'],
          ['photo-1505142468610-359e7d316be0', 'Wave line pass'],
          ['photo-1439405326854-014607f694d7', 'Surfer, low angle'],
          ['photo-1519046904884-53103b34b206', 'Beach approach'],
          ['photo-1502680390469-be75c86b636f', 'Barrel ride'],
          ['photo-1500375592092-40eb2168fd21', 'Open ocean'],
        ],
        seedBase + 5,
      ),
    },
    {
      title: 'HERITAGE RESORT FILM',
      category: 'Aerial Videography',
      location: 'Kerala, India',
      year: '2025',
      ticket_rows: ['AERIAL VIDEOGRAPHY', 'BRAND FILM', '2025'],
      short_key: '// heritage resort film',
      short_desc:
        '— sunrise mist aerials and cinematic hospitality storytelling crafted for luxury tourism.',
      full_description:
        'A luxury tourism brand film for a heritage resort on the Kerala backwaters. Dawn mist aerials over the rice paddies, slow reveals of the tharavadu architecture, and warm interiors shot during blue hour. Delivered as a 90-second hero film plus 15-second cutdowns for social.',
      preview_video_url: PREVIEW_VIDEOS.living,
      youtube_urls: [],
      gallery_images: g(
        [
          ['photo-1571896349842-33c89424de2d', 'Pool at sunrise'],
          ['photo-1582719508461-905c673771fd', 'Heritage suite'],
          ['photo-1540541338287-41700207dee6', 'Backwater deck'],
          ['photo-1520250497591-112f2f40a3f4', 'Palm lagoon'],
          ['photo-1551882547-ff40c63fe5fa', 'Evening lights'],
          ['photo-1566073771259-6a8506099945', 'Resort facade'],
        ],
        seedBase + 6,
      ),
    },
  ]

  return rows.map((r, i) => ({
    id: mkid(),
    slug: r.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    full_description: '',
    ...r,
    sort_order: i,
    is_published: true,
    created_at: new Date(Date.UTC(2026, 0, 10 + i)).toISOString(),
  })) as Project[]
}

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    wordmark: 'AB VISUALS',
    script: 'Professional Drone Services & Wedding Cinematography',
    scrollHint: 'SCROLL INTO THE WORK',
  },
  badge: {
    heading: 'DRONE PILOT\nID CARD',
    year: '2026',
    role: 'AERIAL DIRECTOR // CINEMATOGRAPHER',
    photoUrl: '',
    rows: [
      { label: 'AGENCY', value: 'AB VISUALS' },
      { label: 'FOCUS', value: 'DRONE & WEDDING CINEMA' },
      { label: 'INSTA', value: '@AB.VISUALS' },
      { label: 'CONTACT', value: '+91 98765 43210' },
    ],
  },
  nav: {
    studio: 'my studio',
    portfolio: 'portfolio',
    services: 'services & contact',
    book: 'book a shoot',
    caseLogo: 'AB VISUALS',
  },
  ticket: {
    viewFull: 'VIEW FULL PROJECT (PHOTOS & VIDEO) →',
    browseAll: 'Browse All Projects ⇝',
    prevLabel: 'previous\ncase',
    nextLabel: 'next\ncase',
    screenCue: 'Click / Tap to Open Full Project',
    allProjectsHeading: 'All Projects',
  },
  contact: {
    name: 'Amit Sharma',
    phone: '+91 98765 43210',
    whatsappNumber: '919876543210',
    whatsappGreeting: 'Hi AB VISUALS! I want to book a shoot.',
    email: 'hello@abvisuals.in',
    city: 'Mumbai · Available across India',
    instagramHandle: '@AB.VISUALS',
    phoneOrEmailShort: '+91 98765 43210',
    availability: 'Available across India · Mon–Sun · 6 AM – 11 PM',
  },
  socials: {
    instagramUrl: 'https://instagram.com/ab.visuals',
    instagramLabel: 'Instagram',
    instagramShow: true,
    youtubeUrl: 'https://youtube.com/@abvisuals',
    youtubeLabel: 'YouTube',
    youtubeShow: true,
    whatsappUrl: 'https://wa.me/919876543210?text=Hi%20AB%20VISUALS!',
    whatsappLabel: 'WhatsApp',
    whatsappShow: true,
  },
  services: [
    { id: 's1', title: 'Professional Drone Services', tag: 'AERIAL', desc: 'Licensed DGCA-compliant drone operations for films, ads and industrial work.' },
    { id: 's2', title: 'Wedding Cinematography', tag: 'WEDDING', desc: 'Cinematic wedding films with sweeping aerial reveals and intimate ground storytelling.' },
    { id: 's3', title: 'Pre-Wedding Shots', tag: 'PRE-WEDDING', desc: 'Aerial + ground pre-wedding films at palaces, mountains, beaches and city rooftops.' },
    { id: 's4', title: 'Aerial Videography', tag: 'AERIAL VIDEO', desc: 'High-altitude brand films, resort walkthroughs and tourism storytelling.' },
    { id: 's5', title: 'Events & Concerts', tag: 'EVENTS', desc: 'FPV fly-throughs and multi-camera coverage for concerts, festivals and live stages.' },
    { id: 's6', title: 'Real Estate & Commercial Shoots', tag: 'REAL ESTATE', desc: 'Architectural exterior-to-interior drone tours and commercial brand content.' },
    { id: 's7', title: 'Cinematic Drone Shots', tag: 'FPV', desc: 'Custom high-speed FPV chase sequences, orbits and one-take reveal shots.' },
  ],
  drawer: {
    heading: 'Services & Contact',
    subheading: 'Drone · Wedding · Events · Real Estate — one crew for every frame.',
    ctaText: 'Enquire on WhatsApp',
  },
}
