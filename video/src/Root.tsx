import React from "react";
import { Composition } from "remotion";
import { ClimaSchoolExplainer } from "./ClimaSchoolExplainer";
import { FPS, TOTAL_FRAMES } from "./theme";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ClimaSchoolExplainer"
      component={ClimaSchoolExplainer}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
