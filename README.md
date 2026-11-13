# B.Bilguun — portfolio

A bilingual (English / Mongolian) portfolio where a swarm of multiplayer-style
cursors draws every part of the page into place.

React 19 · Vite · TypeScript · TanStack Router · Tailwind CSS v4 · GSAP

## Scripts

| Command           | What it does                                                  |
| ----------------- | ------------------------------------------------------------- |
| `bun dev`         | Start the dev server                                          |
| `bun run build`   | Refresh the gaming stats, type-check and build to `dist/`     |
| `bun run gaming`  | Refresh `src/content/gaming.json` from FACEIT and Steam only  |
| `bun run lint`    | ESLint                                                        |
| `bun run preview` | Serve the built site                                          |

## Structure

```
src/
  main.tsx              entry: router and global styles
  routes/               pages (TanStack file routes; routeTree.gen.ts is generated)
  sections/             the home page, one file or folder per section
    expertise/          section + the skill pile
    career/             section + GPA meter
    afk/                FACEIT and Steam HUD, split into its panels
  components/
    layout/             header, footer, 3D backdrop, swarm cursors, section heading
    overlays/           terminal, command palette, inspect, cursor chat, toasts
    ui/                 Build (the cursor-drawn frame), Heading, BackLink, WaveText,
                        shared class names (styles.ts)
    illustrations/      top-down SVG drawings of the gear (the /uses thumbnails)
    desk-3d/            3D desks on the home page and the 3D model cards on /uses
                        (React Three Fiber, low-poly models at real size)
  games/                the arcade: one file per game, plus registry and helpers
  content/              everything the site says: portfolio, skills, uses, gaming stats
  lib/                  framework glue: i18n, tiny stores, gsap, sound, swarm state,
                        achievements, party mode, tilt
  hooks/                React hooks
  styles/globals.css    Tailwind theme tokens and global CSS
scripts/gaming.mjs      build-time snapshot of FACEIT and Steam stats
```

### Conventions

- **Content lives in `src/content/`.** All visible copy is bilingual, written
  as `t(english, mongolian)`; text that reads the same in both is `same(text)`.
- **A folder only when there is more than one file.** Single-file components
  are plain files (`components/layout/header.tsx`).
- **Wrap anything that should be drawn in by the cursors in `<Build>`**; its
  frame fits the content automatically.
- **Scroll-triggered one-off animations use `onceInView()`** from `lib/gsap`.
- **Fixed-position UI is portalled or rendered outside `#smooth-content`**,
  which ScrollSmoother transforms.
