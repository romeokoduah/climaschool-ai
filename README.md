# ClimaSchool AI

> The weather forecast, but for child health.

ClimaSchool AI turns live climate, air-quality and disease-surveillance data into
hyperlocal, action-led child-health advisories for schools, families and community
health workers across Ghana — in four languages (English, Twi, Hausa, Ga).

This repository contains the **public website and interactive demo** (a React + Vite
single-page app). It showcases the seasonal advisory playbooks and an "Engine Room"
that re-classifies risk live as you change climate inputs.

## Tech stack

- **React 18** + **React Router** (hash routing for static hosting)
- **Vite 5** build tooling
- **Tailwind CSS 3** for styling
- **Framer Motion** for animation (respects `prefers-reduced-motion`)
- **lucide-react** icons

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint       # run ESLint
```

> Requires Node.js 18+.

## Project structure

```
public/            Static assets (icons, manifest, robots, sitemap)
src/
  components/      Reusable UI (Nav, Footer, PageHero, ErrorBoundary, …)
  pages/           Route views (Home, Seasons, Advisory, Engine, About, legal, 404)
  lib/             engine.js (risk classifier), photos.js, analytics.js
  data/            seasons.js — the seasonal advisory content
scripts/           gen-icons.mjs — regenerate PNG app icons
```

## Deployment

The site is built for **GitHub Pages** under the `/climaschool-ai/` base path
(`vite.config.js` → `base`). Deploy with:

```bash
npm run deploy     # builds and publishes dist/ to the gh-pages branch
```

Live URL: <https://romeokoduah.github.io/climaschool-ai/>

## Configuration notes

- **Base path** — set in `vite.config.js`. If you fork/rename the repo, update
  `base` and the absolute URLs in `index.html`, `manifest.webmanifest`,
  `robots.txt`, `sitemap.xml` and `public/404.html`.
- **Analytics** — `src/lib/analytics.js` is a privacy-friendly no-op until you set
  `VITE_ANALYTICS=on` and wire a provider. See the file's header comment.
- **Icons** — regenerate with `npm run gen:icons`.

## Important

Homepage and Engine Room figures are **illustrative** demonstrations of platform
behaviour, not live operational data. Health guidance is general and is **not** a
substitute for professional medical care.

See [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) before a commercial launch.

## Licence

- Software: **MIT** — see [`LICENSE`](./LICENSE).
- Advisory content: **CC-BY 4.0**.

Built by **Eco-lution Consults**, Ghana · info@uniyia.org

Partners: RCEES-UENR · Centre for Climate Change and Sustainability, University of Ghana ·
UNIYIA (United Youth Initiative for Africa) · Medical Advisory Group · Ghana Health Service (district level).
