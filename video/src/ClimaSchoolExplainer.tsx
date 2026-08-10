/**
 * The ClimaSchool AI explainer — 1920×1080, 30 fps, 3600 frames (120 seconds).
 *
 * The paper background is rendered once, outside every sequence, so that scenes
 * cross-dissolve over a continuous ground rather than blinking. The ambient bed
 * is a single looped track spanning the whole film, faded up at the head and
 * down over the last two seconds.
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { S1Problem } from "./scenes/S1Problem";
import { S2WhatItIs } from "./scenes/S2WhatItIs";
import { S3DataIn } from "./scenes/S3DataIn";
import { S4Engine } from "./scenes/S4Engine";
import { S5Gate } from "./scenes/S5Gate";
import { S6Dispatch } from "./scenes/S6Dispatch";
import { S7Chain } from "./scenes/S7Chain";
import { S8Close } from "./scenes/S8Close";
import { SCENES, TOTAL_FRAMES } from "./theme";
import { Background } from "./ui";

const SCENE_COMPONENTS: React.FC<{ dur: number }>[] = [
  S1Problem,
  S2WhatItIs,
  S3DataIn,
  S4Engine,
  S5Gate,
  S6Dispatch,
  S7Chain,
  S8Close,
];

/** Music level over the whole film: up over 2s, held quiet, out over the last 2s. */
const musicVolume = (frame: number): number =>
  interpolate(
    frame,
    [0, 60, TOTAL_FRAMES - 60, TOTAL_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

export const ClimaSchoolExplainer: React.FC = () => (
  <AbsoluteFill>
    <Background />

    <Audio
      src={staticFile("ambient.wav")}
      loop
      // "extend" keeps the frame counter running across loop boundaries, so the
      // fade curve above is read against the composition timeline rather than
      // restarting every 30 seconds.
      loopVolumeCurveBehavior="extend"
      volume={musicVolume}
    />

    {SCENES.map((scene, i) => {
      const Component = SCENE_COMPONENTS[i];
      return (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={scene.from}
          durationInFrames={scene.dur}
          layout="none"
        >
          <Component dur={scene.dur} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
