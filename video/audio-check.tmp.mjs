// Render only the audio bed of the composition to WAV, then measure it.
// Uses the Node API so remotion.config.ts (which sets a CRF) does not apply.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "node:path";

const root = "F:/AI_DEV_LAB/UNICEF/video";
const out = path.join(root, "out", "audio-check.wav");

const serveUrl = await bundle({
  entryPoint: path.join(root, "src", "index.ts"),
  webpackOverride: enableTailwind,
});

const composition = await selectComposition({
  serveUrl,
  id: "ClimaSchoolExplainer",
});

await renderMedia({
  composition,
  serveUrl,
  codec: "wav",
  outputLocation: out,
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 25 === 0) {
      process.stdout.write(`\r${Math.round(progress * 100)}%`);
    }
  },
});

console.log(`\nwrote ${out}`);
