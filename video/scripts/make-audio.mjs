/**
 * make-audio.mjs — synthesises the ambient music bed for the ClimaSchool AI explainer.
 *
 * Pure Node, zero dependencies. Writes a 16-bit PCM stereo RIFF/WAVE file by hand.
 *
 * Design brief: this sits underneath narration text, so it must be calm and
 * unobtrusive — soft sine/triangle pads, a slow warm chord progression, gentle
 * amplitude envelopes, no percussion and no melodic line to compete with reading.
 *
 * Seamless looping is achieved two ways at once:
 *   1. every oscillator and LFO frequency is quantised onto the loop grid
 *      (an integer number of cycles per loop), so the waveform is exactly
 *      periodic and the loop point lands on the same phase — i.e. the same
 *      zero crossing — every time;
 *   2. an equal-power crossfade folds a 2 s tail back over the head, which
 *      absorbs anything the quantisation does not (filter memory in the air
 *      layer, chord release tails spilling past the loop boundary).
 *
 * Level: peak normalised to -20 dBFS so it never fights the on-screen type.
 *
 * Usage:  node scripts/make-audio.mjs
 * Output: public/ambient.wav
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(HERE, "..", "public", "ambient.wav");

// ─────────────────────────── constants ───────────────────────────

const SAMPLE_RATE = 44_100;
const CHANNELS = 2;
const BITS_PER_SAMPLE = 16;

const LOOP_SECONDS = 30;
const CROSSFADE_SECONDS = 2;

const LOOP_SAMPLES = LOOP_SECONDS * SAMPLE_RATE;
const CROSSFADE_SAMPLES = CROSSFADE_SECONDS * SAMPLE_RATE;
const RENDER_SAMPLES = LOOP_SAMPLES + CROSSFADE_SAMPLES;

const PEAK_DBFS = -20;
const PEAK_LINEAR = 10 ** (PEAK_DBFS / 20); // ≈ 0.1

// The fundamental loop frequency. Any oscillator whose frequency is an integer
// multiple of this completes a whole number of cycles per loop.
const LOOP_HZ = 1 / LOOP_SECONDS;

/** Snap a frequency onto the loop grid so the loop point is phase-continuous. */
const snap = (hz) => Math.max(1, Math.round(hz / LOOP_HZ)) * LOOP_HZ;

/** Equal-tempered pitch from a note name, A4 = 440 Hz. */
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const note = (name) => {
  const m = /^([A-G])([b#]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note: ${name}`);
  const [, letter, accidental, octave] = m;
  const semi =
    SEMITONES[letter] +
    (accidental === "#" ? 1 : accidental === "b" ? -1 : 0) +
    (Number(octave) + 1) * 12;
  return 440 * 2 ** ((semi - 69) / 12);
};

// ─────────────────────────── the progression ───────────────────────────
//
// I – vi – IV – V in F major, one chord every 7.5 s. Warm, entirely consonant,
// and it resolves back to the tonic so the loop turns over without a seam.
// Each voicing carries its own root an octave down rather than a fixed pedal,
// so no chord is ever left sitting on a foreign bass note.

const PROGRESSION = [
  { name: "F major add9", notes: ["F2", "F3", "A3", "C4", "G4"] },
  { name: "D minor 9", notes: ["D2", "D3", "F3", "A3", "E4"] },
  { name: "B flat major 7", notes: ["Bb1", "Bb2", "D3", "F3", "A3"] },
  { name: "C major add9", notes: ["C2", "C3", "E3", "G3", "D4"] },
];

const CHORD_SECONDS = LOOP_SECONDS / PROGRESSION.length; // 7.5 s
const CHORD_FADE = 2.5; // attack and release, generous so chords bleed into each other
const CHORD_PAD = 1.25; // how far each chord starts before / ends after its slot

// ─────────────────────────── helpers ───────────────────────────

const TAU = Math.PI * 2;

/** 0→1 smoothstep; C1-continuous at both ends, so envelopes never click. */
const smoothstep = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Trapezoidal envelope with smoothstep shoulders. */
const envelope = (t, start, end, fade) => {
  if (t <= start || t >= end) return 0;
  return smoothstep((t - start) / fade) * smoothstep((end - t) / fade);
};

/**
 * A soft pad voice: a sine fundamental with a few gently rolled-off partials.
 * The partial weights sit between a pure sine and a triangle — enough upper
 * harmonic to stop it sounding like a test tone, not enough to draw attention.
 */
const PARTIALS = [
  { mult: 1, gain: 1.0 },
  { mult: 2, gain: 0.14 },
  { mult: 3, gain: 0.07 },
  { mult: 4, gain: 0.03 },
  { mult: 5, gain: 0.015 },
];

const voice = (hz, t) => {
  let sum = 0;
  for (const { mult, gain } of PARTIALS) {
    // Roll the top off hard above the presence region — this bed must stay dark.
    if (hz * mult > 5000) break;
    sum += gain * Math.sin(TAU * hz * mult * t);
  }
  return sum;
};

// ─────────────────────────── the air layer ───────────────────────────
//
// A whisper of low-passed noise, far below the pads, that stops the chords
// sounding synthetic. Generated over exactly one loop and then read cyclically,
// with the filter primed by a warm-up pass so its memory matches at the seam.

const makeAirLayer = () => {
  // Deterministic noise — a fixed seed keeps renders byte-identical.
  let seed = 0x9e3779b9;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff - 0.5;
  };

  const raw = new Float32Array(LOOP_SAMPLES);
  for (let i = 0; i < LOOP_SAMPLES; i++) raw[i] = rand();

  // Four cascaded one-pole low passes ≈ a steep, very dull filter (~200 Hz).
  const a = 1 - Math.exp((-TAU * 200) / SAMPLE_RATE);
  const out = new Float32Array(LOOP_SAMPLES);
  const state = [0, 0, 0, 0];

  // Two passes: the first only exists to settle the filter state, so that the
  // state entering sample 0 of the kept pass matches the state leaving the end.
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < LOOP_SAMPLES; i++) {
      let x = raw[i];
      for (let k = 0; k < state.length; k++) {
        state[k] += a * (x - state[k]);
        x = state[k];
      }
      if (pass === 1) out[i] = x;
    }
  }

  // Normalise to unity so the caller can set an honest level.
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  if (peak > 0) for (let i = 0; i < LOOP_SAMPLES; i++) out[i] /= peak;
  return out;
};

// ─────────────────────────── render ───────────────────────────

/**
 * Pre-resolve every chord into stereo voice descriptors.
 * Left and right are detuned by ~1.5 cents' worth of ratio and then re-snapped
 * to the loop grid, which gives a slow, wide beating without breaking the loop.
 */
const CHORDS = PROGRESSION.map((chord, index) => {
  const slotStart = index * CHORD_SECONDS;
  return {
    ...chord,
    start: slotStart - CHORD_PAD,
    end: slotStart + CHORD_SECONDS + CHORD_PAD,
    voices: chord.notes.map((n, voiceIndex) => {
      const base = note(n);
      return {
        left: snap(base),
        right: snap(base * 1.0015),
        // Lower notes carry the body; upper voices sit back so the chord never
        // turns bright. Roughly a 1/sqrt(f) tilt against the lowest note.
        gain: Math.min(1, Math.sqrt(note(chord.notes[0]) / base)) ** 1.15,
        // Each voice breathes on its own slow LFO, all snapped to the loop grid
        // so the whole texture stays exactly periodic.
        lfoHz: snap(1 / (13 + voiceIndex * 3.5)),
        lfoPhase: (voiceIndex * TAU) / chord.notes.length,
      };
    }),
  };
});

const AIR = makeAirLayer();
const AIR_GAIN = 0.028; // ≈ -31 dB relative to the pads before normalisation

// A single very slow swell across the whole loop, so 30 s of pad does not sit
// at one static level. Two cycles per loop keeps it periodic by construction.
const swell = (t) => 0.88 + 0.12 * Math.sin(TAU * (2 * LOOP_HZ) * t - Math.PI / 2);

const renderChannel = (channel) => {
  const buf = new Float32Array(RENDER_SAMPLES);

  for (let i = 0; i < RENDER_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    // Chord instances are evaluated at k = -1 .. +4 so that the release of the
    // chord before the loop start and the attack of the chord after the loop
    // end are both present. Combined with the grid-snapped phases this makes
    // the signal genuinely periodic over LOOP_SECONDS.
    for (let k = -1; k <= PROGRESSION.length; k++) {
      const index = ((k % PROGRESSION.length) + PROGRESSION.length) % PROGRESSION.length;
      const chord = CHORDS[index];
      // Shift the chord's own slot by whole loops so k = -1 is the previous
      // loop's last chord and k = 4 is the next loop's first chord.
      const offset = Math.floor(k / PROGRESSION.length) * LOOP_SECONDS;
      const env = envelope(t, chord.start + offset, chord.end + offset, CHORD_FADE);
      if (env <= 0) continue;

      for (const v of chord.voices) {
        const hz = channel === 0 ? v.left : v.right;
        const breath = 1 + 0.12 * Math.sin(TAU * v.lfoHz * t + v.lfoPhase + (channel ? 0.6 : 0));
        sample += voice(hz, t) * v.gain * env * breath;
      }
    }

    sample *= swell(t);
    // The air layer is read cyclically and offset between channels for width.
    const airIndex = (i + (channel ? 7919 : 0)) % LOOP_SAMPLES;
    sample += AIR[airIndex] * AIR_GAIN * (0.6 + 0.4 * swell(t));

    buf[i] = sample;
  }

  return buf;
};

console.log("Synthesising ambient bed…");
console.log(
  `  progression: ${PROGRESSION.map((c) => c.name).join(" → ")} (${CHORD_SECONDS}s each)`,
);

const rendered = [renderChannel(0), renderChannel(1)];

// ─────────────────────────── loop crossfade ───────────────────────────
//
// Equal-power (sin/cos) crossfade of the rendered tail back over the head.
// out[i] = head[i]·sin(θ) + tail[i]·cos(θ) for the first CROSSFADE_SAMPLES.

const looped = rendered.map((buf) => {
  const out = new Float32Array(LOOP_SAMPLES);
  out.set(buf.subarray(0, LOOP_SAMPLES));
  for (let i = 0; i < CROSSFADE_SAMPLES; i++) {
    const theta = ((i / CROSSFADE_SAMPLES) * Math.PI) / 2;
    out[i] = buf[i] * Math.sin(theta) + buf[LOOP_SAMPLES + i] * Math.cos(theta);
  }
  return out;
});

// ─────────────────────────── normalise ───────────────────────────

let peak = 0;
for (const ch of looped) for (const v of ch) peak = Math.max(peak, Math.abs(v));
const gain = peak > 0 ? PEAK_LINEAR / peak : 0;
for (const ch of looped) for (let i = 0; i < ch.length; i++) ch[i] *= gain;

// ─────────────────────────── WAV encoding ───────────────────────────

const bytesPerSample = BITS_PER_SAMPLE / 8;
const blockAlign = CHANNELS * bytesPerSample;
const byteRate = SAMPLE_RATE * blockAlign;
const dataBytes = LOOP_SAMPLES * blockAlign;

const buffer = Buffer.alloc(44 + dataBytes);
buffer.write("RIFF", 0, "ascii");
buffer.writeUInt32LE(36 + dataBytes, 4); // chunk size = file size - 8
buffer.write("WAVE", 8, "ascii");
buffer.write("fmt ", 12, "ascii");
buffer.writeUInt32LE(16, 16); // PCM fmt chunk length
buffer.writeUInt16LE(1, 20); // audio format 1 = PCM
buffer.writeUInt16LE(CHANNELS, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
buffer.write("data", 36, "ascii");
buffer.writeUInt32LE(dataBytes, 40);

let cursor = 44;
for (let i = 0; i < LOOP_SAMPLES; i++) {
  for (let c = 0; c < CHANNELS; c++) {
    // Round-to-nearest, then clamp to the 16-bit range.
    const clamped = Math.max(-1, Math.min(1, looped[c][i]));
    const value = Math.max(-32768, Math.min(32767, Math.round(clamped * 32767)));
    buffer.writeInt16LE(value, cursor);
    cursor += bytesPerSample;
  }
}

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, buffer);

// ─────────────────────────── report ───────────────────────────

const dbfs = (x) => (x > 0 ? (20 * Math.log10(x)).toFixed(2) : "-inf");
let rms = 0;
for (const ch of looped) for (const v of ch) rms += v * v;
rms = Math.sqrt(rms / (LOOP_SAMPLES * CHANNELS));

const seam = Math.max(
  ...looped.map((ch) => Math.abs(ch[0] - ch[LOOP_SAMPLES - 1])),
);

console.log(`  wrote ${OUT_PATH}`);
console.log(`  ${LOOP_SECONDS}s · ${SAMPLE_RATE} Hz · ${CHANNELS}ch · ${BITS_PER_SAMPLE}-bit · ${(dataBytes / 1e6).toFixed(2)} MB`);
console.log(`  peak ${dbfs(PEAK_LINEAR)} dBFS · rms ${dbfs(rms)} dBFS`);
console.log(`  loop seam discontinuity: ${seam.toExponential(2)} (0 = perfectly continuous)`);
