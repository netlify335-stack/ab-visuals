# AB VISUALS — Cinematic Drone & Wedding Portfolio + Studio CMS

A production-ready, one-screen interactive portfolio for **AB VISUALS** (professional drone pilot, aerial
cinematographer and wedding film studio) with a secret, passcode-protected CMS at **`/amit231106`**.

Visitors land on a photographic studio hero — the pilot with a laptop, a giant wordmark behind him, a swinging
lanyard ID badge and a handwritten tagline — then scroll into the laptop: a 5-second cinema transition dives into the
screen where the active project plays, framed by a punched paper ticket card and prev/next controls. Tapping the laptop
opens a full-screen cinema showcase with inline HD YouTube playback, an unlimited photo gallery and a full-screen
zoomable lightbox.

---

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Custom CSS design system (Tailwind v4 also wired in) |
| Routing | History API SPA with rewrite fallbacks (`vercel.json`, `public/_redirects`) |
| Media | Client-side Canvas → WebP compression (max 2048px, q0.85) before upload |
| Backend | Supabase (Postgres + Storage bucket `ab-visuals-media`) — optional |
| Fallback | IndexedDB + LocalStorage adapter, pre-seeded so the app works with zero config |

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle in dist/
npm run preview
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero stage, laptop dive, case ticket, prev/next, full-screen showcase, all-projects drawer, services & contact drawer, booking modal, bottom social bar |
| `/amit231106` | Passcode-protected studio CMS (hidden from all public menus) |

Any other path redirects to `/`. Both rewrite configs ship SPA fallbacks so direct loads and refreshes never 404.

## Admin CMS (`/amit231106`)

Default passcode: **`amit231106`** — change it under *Database & Security* immediately after first login.

| Tab | Capabilities |
| --- | --- |
| Projects & Media | Full CRUD, publish/draft, ordering, 3 ticket metadata lines, teaser + full story, unlimited drag-and-drop photo uploads with per-file progress, cover selection, reorder, delete, captions, YouTube manager with live embed previews, optional MP4 laptop preview |
| Contact & Socials | Brand/pilot, phones, WhatsApp number + greeting, email, studio address, Instagram/YouTube/WhatsApp links with show/hide toggles, drawer copy and CTA labels — one edit updates the badge, every CTA and the bottom bar |
| Website Text & Services | Hero wordmark, handwritten script, scroll hint, lanyard badge (heading/year/role/photo + 4 editable rows with `{instagram}` / `{phone}` / `{email}` tokens), all nav + case-mode labels, and a full services manager |
| Database & Security | Cloud connection test, 1-minute SQL migration with copy button, passcode change, JSON backup export/import, reset text to defaults, recent inquiry log |

## Connect Supabase (optional but recommended)

`IndexedDB` only stores media on one device. To make uploads visible on every visitor's phone and laptop:

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor — it creates `projects`, `site_content`,
   `inquiries`, RLS policies and the public `ab-visuals-media` storage bucket.
3. Open `/amit231106` → *Database & Security* → paste the project URL and anon/publishable key → **Test** → **Save &
   connect**. The app reloads in cloud mode and seeds the six starter projects if the tables are empty.

Prefer env vars? Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

A config saved in the admin panel overrides the build-time env values.

> **Security note:** the CMS passcode is a client-side gate, and the starter policies allow anonymous writes so the
> site works out of the box. For a hardened deployment, replace the write policies with Supabase Auth (authenticated
> role only) and sign the admin in before writing.

## Project structure

```
src/
  App.tsx                 History-API router (/ and /amit231106)
  pages/
    Home.tsx              Scene choreography, laptop dive, case mode, modals
    Admin.tsx             Passcode gate + CMS shell
  components/
    Showcase.tsx          Full-screen project cinema (YouTube + story + gallery)
    Lightbox.tsx          100% full-screen zoomable photo viewer
    AllProjects.tsx       Filterable projects drawer
    ContactDrawer.tsx     Services + live contact + inquiry form
    BookingModal.tsx      Quick WhatsApp booking
    InquiryForm.tsx       Validated inquiry → WhatsApp + lead log
    SocialBar.tsx         Instagram / YouTube / WhatsApp pill bar
    admin/                Projects, Contact, Site Text, Settings tabs
  lib/
    store.ts              Cloud/local adapter, uploads, seeding, backup
    supabase.ts           Client + config resolution
    idb.ts                Tiny IndexedDB wrapper
    media.ts              Canvas WebP compression
    youtube.ts            Any-URL → video id parsing
    defaults.ts           AB VISUALS seed content, assets, SQL
  styles/                 base / scene / modals / admin stylesheets
supabase/schema.sql       One-shot database + storage migration
```

## Key interactions

- **Hero → laptop**: wheel down (`Δy ≥ 18`), swipe up (`≥ 40px`), `↓` / `PageDown` / `Space`, or the
  **portfolio** tag. The transition clip plays at an eased `0.9×–4.2×` playback rate (~1.7s) driven by `requestAnimationFrame`,
  with a graceful fallback when the clip is blocked or reduced motion is requested.
- **Laptop screen**: tap/click anywhere on the screen, the ticket CTA or a project card to open the cinema showcase.
- **Case mode**: `←` / `→` or horizontal swipe flips projects; `Esc`, the centre logo or **my studio** returns home.
- **Mobile**: compact tag row, mini ID badge, laptop sized above the social bar, swipe gestures everywhere.
