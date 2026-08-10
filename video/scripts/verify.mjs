/**
 * verify.mjs — inspect the rendered file without an external ffmpeg.
 *
 * Uses @remotion/media-parser, which ships as a dependency of @remotion/cli,
 * to read the container directly: duration, frame rate, dimensions, codecs, and
 * the audio track. Audio packets are counted and measured so that "audio is
 * present" means actual encoded signal, not just a declared empty track —
 * AAC digital silence compresses to a handful of bytes per packet.
 *
 * Usage: node scripts/verify.mjs [path-to-mp4]
 */

import { statSync } from "node:fs";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";

const file = process.argv[2] ?? "out/climaschool-explainer.mp4";

const stat = statSync(file);

let audioPackets = 0;
let audioBytes = 0;
let videoPackets = 0;

/**
 * Encoded AAC packet size tracks how much signal there is to encode, so a
 * profile of bytes-per-second is a cheap stand-in for a level meter: it shows
 * the fade up at the head, the fade down at the tail, and — importantly —
 * whether the 30-second music loop dips at its seams.
 */
const BUCKET_SECONDS = 5;
const buckets = new Map();

const result = await parseMedia({
  src: file,
  reader: nodeReader,
  fields: {
    container: true,
    durationInSeconds: true,
    dimensions: true,
    fps: true,
    videoCodec: true,
    audioCodec: true,
    tracks: true,
  },
  onAudioTrack: (track) => {
    const timescale = track.track?.timescale ?? 1_000_000;
    return (sample) => {
      audioPackets += 1;
      audioBytes += sample.data.byteLength;
      const seconds = sample.timestamp / timescale;
      const bucket = Math.floor(seconds / BUCKET_SECONDS) * BUCKET_SECONDS;
      const current = buckets.get(bucket) ?? { bytes: 0, count: 0 };
      current.bytes += sample.data.byteLength;
      current.count += 1;
      buckets.set(bucket, current);
    };
  },
  onVideoTrack: () => () => {
    videoPackets += 1;
  },
});

const tracks = Array.isArray(result.tracks)
  ? result.tracks
  : [...(result.tracks.videoTracks ?? []), ...(result.tracks.audioTracks ?? [])];
const audioTrack = tracks.filter((t) => t.type === "audio")[0];

console.log(`file          ${file}`);
console.log(`size          ${(stat.size / 1e6).toFixed(2)} MB (${stat.size} bytes)`);
console.log(`container     ${result.container}`);
console.log(`duration      ${result.durationInSeconds?.toFixed(3)} s`);
console.log(`fps           ${result.fps}`);
console.log(`dimensions    ${result.dimensions?.width} x ${result.dimensions?.height}`);
console.log(`video codec   ${result.videoCodec}`);
console.log(`audio codec   ${result.audioCodec}`);
if (audioTrack) {
  console.log(
    `audio track   ${audioTrack.numberOfChannels ?? "?"} ch @ ${audioTrack.sampleRate ?? "?"} Hz`,
  );
}
console.log(`video packets ${videoPackets}`);
console.log(
  `audio packets ${audioPackets} · ${(audioBytes / 1024).toFixed(1)} KiB · mean ${
    audioPackets ? (audioBytes / audioPackets).toFixed(1) : 0
  } bytes/packet`,
);
console.log(
  audioPackets > 0 && audioBytes / audioPackets > 20
    ? "audio        PRESENT and carrying signal"
    : "audio        MISSING or silent",
);

if (buckets.size > 0) {
  const means = [...buckets.values()].map((b) => b.bytes / b.count);
  const spread = Math.max.apply(null, means) - Math.min.apply(null, means);
  if (spread < 1) {
    console.log(
      "\nnote          the AAC stream is constant bitrate, so packet size is not a\n" +
        "              level meter. To measure the actual music envelope, render the\n" +
        "              composition to WAV with the Node API (remotion.config.ts sets a\n" +
        "              CRF, which the wav codec rejects) and analyse the samples.",
    );
  }
}
