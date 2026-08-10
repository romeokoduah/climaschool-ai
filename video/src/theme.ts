/**
 * Brand tokens for the ClimaSchool AI explainer.
 *
 * Colours are lifted verbatim from the product's tailwind.config.js so the film
 * and the public site cannot drift apart. Type is the same three-family system:
 * Fredoka for display, Nunito for body copy, Caveat for the handwritten accent.
 */

import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";

export const DISPLAY = loadFredoka("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const BODY = loadNunito("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

export const HAND = loadCaveat("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  ink: "#1a140a",
  ink2: "#5b513e",
  ink3: "#95876c",
  paper: "#ffffff",
  cream: "#fbf7ee",
  cream2: "#f3ecdc",
  line: "#ece4d2",
  line2: "#d9cdb1",
  heat: "#ff6a3d",
  sun: "#ffc94d",
  sky: "#5e9bff",
  leaf: "#5fc16f",
  mint: "#5fd6c4",
  coral: "#ff7b9d",
  plum: "#7c5cff",
  /** The only colour not in the site palette: RED needs to read as distinct
   *  from the heat-orange accent, so it is a deeper, warmer red beside it. */
  red: "#e03a2f",
} as const;

/** The season accents the site sets on <body data-season>. */
export const SEASON = {
  harmattan: "#f0a948",
  dryheat: "#ff6a3d",
  firstrains: "#5e9bff",
  secondrains: "#5fc16f",
} as const;

export const SHADOW = {
  soft: "0 6px 16px -8px rgba(60, 40, 10, .18)",
  lift: "0 16px 36px -14px rgba(60, 40, 10, .28)",
  big: "0 30px 70px -28px rgba(60, 40, 10, .38)",
} as const;

export const RADIUS = { md: 18, lg: 22, xl: 30, xxl: 40, pill: 999 } as const;

/** Horizontal safe margin for full-bleed 1920 layouts. */
export const MARGIN = 110;

/**
 * The film's eight scenes. Kept in one place so the timeline, the audio fade
 * and the scene components can never disagree about where a section starts.
 * 30 fps · 3600 frames · 120 seconds exactly.
 */
export const SCENES = [
  { id: "problem", from: 0, dur: 450 },
  { id: "what", from: 450, dur: 300 },
  { id: "data", from: 750, dur: 450 },
  { id: "engine", from: 1200, dur: 600 },
  { id: "gate", from: 1800, dur: 450 },
  { id: "dispatch", from: 2250, dur: 600 },
  { id: "chain", from: 2850, dur: 450 },
  { id: "close", from: 3300, dur: 300 },
] as const;

export const TOTAL_FRAMES = 3600;
export const FPS = 30;
