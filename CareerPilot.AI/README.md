# CareerPilot.AI — UI Redesign

This bundle contains **only the files that changed** for the redesign. Drop them
into your existing `frontend/` project, overwriting the matching paths. No new
npm packages are required — everything uses Tailwind (already in your
`package.json`) plus `next/font/google`, which ships with Next.js 14.

## How to apply

1. Copy `pages/`, `components/`, `styles/globals.css`, and `tailwind.config.js`
   from this bundle into your project, overwriting the existing files.
2. `pages/index.tsx` was **not** changed — leave it as is.
3. Run `npm run dev` as usual. The first build will fetch Inter, Space
   Grotesk, and JetBrains Mono from Google Fonts (needs an internet
   connection at build time — normal for `next/font/google`).

## What changed

- **Design system**: new color tokens (ink navy, indigo primary, amber
  "signal" accent, emerald "verified" accent), a display/body/mono type
  scale (Space Grotesk / Inter / JetBrains Mono), and shared shadow/animation
  tokens — all in `tailwind.config.js`.
- **Login & Register**: rebuilt as a split-screen layout — a dark brand panel
  with an animated "career graph" constellation on the left, a clean card
  form with icon-prefixed inputs on the right. Both pages now share
  `AuthLayout`, `FormField`, and `BrandMark` so they stay visually consistent
  as you add more auth screens.
- **Dashboard**: replaced the unstyled placeholder with a proper app shell —
  a sticky top bar with your avatar initials and logout, a profile summary
  card, a drag-and-drop resume upload card, and a "Resume Intelligence
  Report" panel that shows extracted email/phone (with found/not-found
  states) and skills as tags. It has a real empty state before upload and a
  scanning skeleton while parsing — no functional logic was changed, only
  presentation.
- **Google Sign-In button**: same behavior, just typed properly (removed the
  `any` type so `next lint` / `next build` pass cleanly) and given a
  centered, consistent wrapper.

Verified with a full `next build` (type-check + lint + production build) —
compiles clean. The only build error I hit in my sandbox was Google Fonts
being unreachable behind my own network allowlist; that will resolve
automatically on your machine since it has normal internet access.

## Notes for future milestones

- All new UI pieces are componentized (`components/`) so later features
  (job matching, resume scoring) can reuse `FormField`, `Topbar`,
  `ProfileCard`, and the report-card pattern instead of one-off styles.
- Colors/fonts are centralized in `tailwind.config.js` — change them there
  once instead of hunting through pages.
