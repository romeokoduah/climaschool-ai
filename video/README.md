# ClimaSchool AI — explainer film

A two-minute explainer built with [Remotion](https://remotion.dev).

This folder is **self-contained**: it has its own `package.json` and its own
`node_modules`, and shares nothing with the React app in the repository root.
Nothing here touches `/package.json`, `/src` or `/backend`.

## Specification

| | |
|---|---|
| Composition id | `ClimaSchoolExplainer` |
| Resolution | 1920 × 1080 |
| Frame rate | 30 fps |
| Length | 3600 frames — exactly 120 seconds |
| Output | `out/climaschool-explainer.mp4` (H.264) |

## Commands

```bash
npm install          # once
npm run audio        # regenerate public/ambient.wav
npm run dev          # Remotion Studio
npm run render       # writes out/climaschool-explainer.mp4
```

## Structure

```
scripts/make-audio.mjs   synthesises the ambient music bed (pure Node, no deps)
public/ambient.wav       the generated 30 s seamless loop
src/theme.ts             brand tokens, mirrored from ../tailwind.config.js
src/ui.tsx               scene shell, entrance helpers, background, geometry
src/icons.tsx            hand-built SVG glyphs
src/scenes/S1…S8         the eight scenes
src/ClimaSchoolExplainer.tsx   timeline and audio bed
```

## The eight scenes

| # | Frames | Seconds | Scene |
|---|---|---|---|
| 1 | 0–450 | 0–15 | The problem — four Ghanaian seasons, four hazard profiles |
| 2 | 450–750 | 15–25 | What ClimaSchool AI is, and what it is not |
| 3 | 750–1200 | 25–40 | Data in — the five data categories |
| 4 | 1200–1800 | 40–60 | The risk engine — six modules, one score, four bands |
| 5 | 1800–2250 | 60–75 | The AI safety gate — ORANGE and RED never self-issue |
| 6 | 2250–2850 | 75–95 | Dispatch — one alert, five actors, five actions |
| 7 | 2850–3300 | 95–110 | The alert lifecycle and Minutes of Protection |
| 8 | 3300–3600 | 110–120 | Open source, built in Ghana, two pilot zones |

## Sources

Content is taken from the programme document, and the technical detail is read
from the codebase so the film cannot drift from the product:

- band thresholds, the six hazard modules and the confidence rule —
  `../backend/app/services/risk_engine.py`
- the alert lifecycle states and the reviewer fields — `../backend/app/models.py`
- colours and type — `../tailwind.config.js` and `../src/index.css`

Every worked figure on screen comes from the document's own illustrative
examples and is labelled as illustrative.

## Audio

There is no ffmpeg on the authoring machine and no licensed music, so the bed is
synthesised. `scripts/make-audio.mjs` writes a 16-bit PCM stereo WAV by hand —
RIFF header and samples — with a slow I–vi–IV–V pad in F major, no percussion
and no melody. Every oscillator frequency is snapped onto the loop grid so the
30-second loop is exactly periodic, and a 2-second equal-power crossfade folds
the tail back over the head. Peak is normalised to −20 dBFS so it sits under the
type. It is faded up over the first two seconds and out over the last two.
