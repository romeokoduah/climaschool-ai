# Production / Commercialization Checklist

This audit pass made the site technically production-ready. The items below
require a **human decision or external account** and should be completed before a
commercial launch.

## Content & legal (review required)
- [ ] **Legal review** of `src/pages/Privacy.jsx` and `src/pages/Terms.jsx`. The
      copy is a good-faith template, not legal advice. Confirm against Ghana's
      Data Protection Act (2012) and any partner/donor requirements.
- [ ] **Verify brand & contact** — `info@uniyia.org` and "United Youth Initiative
      for Africa (UNIYIA)" appear in the footer, legal pages and metadata.
- [ ] **Verify all factual claims** — "12 pilot schools / 3 regions", the data
      sources listed on the About page (Ghana Met, ERA5, GHS, WHO AQI, GES), and
      the tech stack. Homepage/Engine figures are now labelled *illustrative*.

## Domain, hosting & SEO
- [ ] If using a **custom domain**, update `base` in `vite.config.js` and every
      absolute URL (`index.html` canonical/OG, `manifest.webmanifest`,
      `robots.txt`, `sitemap.xml`, `public/404.html`).
- [ ] Add a **custom social share image** (1200×630). Currently OG/Twitter reuse
      the Unsplash hero photo via URL.
- [ ] Submit `sitemap.xml` to Google Search Console.

## Assets & licensing
- [ ] **Image licensing** — homepage/section photos load from Unsplash hot-links.
      For commercial use, self-host licensed assets in `public/` and update
      `src/lib/photos.js`. Hot-linking is fragile and not recommended for prod.
- [ ] Replace the generated brand icons (`public/icon-*.png`) with a designed mark
      if desired (`npm run gen:icons` regenerates the current placeholder).

## Analytics & monitoring
- [ ] Choose a **privacy-friendly analytics** provider (Plausible/Fathom/GA4),
      add its script to `index.html`, set `VITE_ANALYTICS=on`, and point
      `src/lib/analytics.js` at it.
- [ ] Wire **error reporting** (e.g. Sentry) into `src/components/ErrorBoundary.jsx`.

## Engineering hygiene (optional next steps)
- [ ] Add a **CI workflow** (GitHub Actions) running `npm ci && npm run lint && npm run build`.
- [ ] Add **unit tests** for `src/lib/engine.js` (the risk classifier) — it has
      clear inputs/outputs and is the highest-value thing to test.
- [ ] Consider a **Content-Security-Policy** (allow self + fonts.googleapis/gstatic
      + images.unsplash) once asset origins are finalized.

## Accessibility (verify on real devices)
- [ ] Run an automated audit (Lighthouse / axe). The pass already added: skip
      link, focus-visible styles, reduced-motion support, labelled form controls,
      image alt text, and proper button semantics.
- [ ] Spot-check **colour contrast** of the lightest text token (`ink-3`,
      `#95876c`) on cream backgrounds for small-text AA if you tighten standards.
