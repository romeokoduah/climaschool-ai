/**
 * Scene 4 (40–60s) — The risk engine.
 *
 * Two beats inside one scene:
 *   A. the six hazard modules combining into a score, a band and a confidence
 *      figure that carries its evidence trail;
 *   B. the four bands and what each one makes the platform do.
 *
 * Module names, band thresholds and the review rule are taken from
 * backend/app/services/risk_engine.py. The worked numbers are the document's
 * own illustrative alert display and are labelled as such on screen.
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  IconAir,
  IconDisease,
  IconHeat,
  IconLock,
  IconNutrition,
  IconWater,
  IconWellbeing,
} from "../icons";
import { BODY, C, DISPLAY, HAND, RADIUS, SHADOW } from "../theme";
import {
  Eyebrow,
  IllustrativeTag,
  Rise,
  Scene,
  Title,
  bezierPath,
  bezierPoint,
  eased,
  useCountUp,
} from "../ui";

// ─────────────────────────── beat shell ───────────────────────────

const Beat: React.FC<{ dur: number; children: React.ReactNode }> = ({
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = eased(frame, 0, 12) - eased(frame, dur - 12, dur);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ─────────────────────────── beat A: modules → score ───────────────────────────

type Module = {
  name: string;
  score: number;
  color: string;
  Icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
};

/**
 * Illustrative module scores for a hot, dusty day in the north — the scenario
 * behind the document's worked alert. Run through the real engine's arithmetic
 * these give an overall of 91.7 and a confidence of 84%, which is what the
 * panel on the right displays.
 */
const MODULES: Module[] = [
  { name: "Heat", score: 84, color: C.heat, Icon: IconHeat },
  { name: "Flood and WASH", score: 20, color: C.sky, Icon: IconWater },
  { name: "Climate-sensitive disease", score: 48, color: C.mint, Icon: IconDisease },
  { name: "Air quality", score: 72, color: C.plum, Icon: IconAir },
  { name: "Nutrition", score: 55, color: C.leaf, Icon: IconNutrition },
  { name: "Mental wellbeing", score: 60, color: C.coral, Icon: IconWellbeing },
];

const EVIDENCE = [
  "forecast temperature 39.4°C",
  "humidity 31%",
  "three consecutive hot days",
  "poor classroom ventilation",
  "water availability below threshold",
];

const ROW_TOP = 322;
const ROW_H = 78;
const ROW_GAP = 16;
const ROW_X = 110;
const ROW_W = 690;
const PANEL = { x: 968, y: 300, w: 842, h: 610 };

const rowMid = (i: number) => ROW_TOP + i * (ROW_H + ROW_GAP) + ROW_H / 2;

const ModuleFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const target = { x: PANEL.x - 12, y: PANEL.y + 210 };

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {MODULES.map((m, i) => {
        const p0 = { x: ROW_X + ROW_W + 10, y: rowMid(i) };
        const p1 = { x: p0.x + 90, y: p0.y };
        const p2 = { x: target.x - 110, y: target.y };
        const drawn = eased(frame, 110 + i * 8, 150 + i * 8);
        const flow = (frame - (150 + i * 8)) / 56;
        const t = flow > 0 ? Math.min(1, flow) : -1;

        return (
          <g key={m.name}>
            <path
              d={bezierPath(p0, p1, p2, target)}
              fill="none"
              stroke={m.color}
              strokeWidth={2.5}
              opacity={0.35}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
            />
            {t >= 0 && t < 1 ? (
              <circle
                cx={bezierPoint(p0, p1, p2, target, t).x}
                cy={bezierPoint(p0, p1, p2, target, t).y}
                r={8}
                fill={m.color}
                opacity={Math.min(1, (1 - t) * 4)}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

const ModuleRow: React.FC<{ m: Module; index: number }> = ({ m, index }) => {
  const frame = useCurrentFrame();
  const delay = 44 + index * 10;
  const enter = eased(frame, delay, delay + 20);
  const fill = eased(frame, delay + 8, delay + 48);
  const shown = Math.round(m.score * fill);

  return (
    <div
      style={{
        position: "absolute",
        left: ROW_X,
        top: ROW_TOP + index * (ROW_H + ROW_GAP),
        width: ROW_W,
        height: ROW_H,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -28}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${m.color}1f`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <m.Icon size={27} color={m.color} stroke={2} />
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 25,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            {m.name}
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 25,
              fontWeight: 600,
              color: m.color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {shown}
          </span>
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 99,
            background: C.cream2,
            border: `1px solid ${C.line}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${m.score * fill}%`,
              height: "100%",
              borderRadius: 99,
              background: m.color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CompositePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = eased(frame, 150, 180);
  const score = useCountUp(91.7, 176, 46, 1);
  const confidence = useCountUp(84, 206, 34);
  const confBar = eased(frame, 206, 240);
  const bandIn = eased(frame, 200, 226);

  return (
    <div
      style={{
        position: "absolute",
        left: PANEL.x,
        top: PANEL.y,
        width: PANEL.w,
        height: PANEL.h,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 22}px)`,
        background: C.paper,
        border: `3px solid ${C.heat}`,
        borderRadius: RADIUS.xxl,
        boxShadow: SHADOW.big,
        padding: 34,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.ink3,
          }}
        >
          Composite child risk assessment
        </span>
        <IllustrativeTag>Illustrative — worked example</IllustrativeTag>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 26,
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 104,
            fontWeight: 600,
            lineHeight: 0.95,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.03em",
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: BODY,
            fontSize: 28,
            fontWeight: 700,
            color: C.ink3,
            paddingBottom: 12,
          }}
        >
          / 100
        </span>
        <span
          style={{
            marginLeft: "auto",
            marginBottom: 8,
            opacity: bandIn,
            transform: `scale(${0.9 + bandIn * 0.1})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 26px",
            borderRadius: RADIUS.pill,
            background: C.red,
            color: C.paper,
            fontFamily: DISPLAY,
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          RED — Act
        </span>
      </div>

      <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 18 }}>
        <span
          style={{
            fontFamily: BODY,
            fontSize: 23,
            fontWeight: 700,
            color: C.ink2,
            width: 128,
          }}
        >
          Confidence
        </span>
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 34,
            fontWeight: 600,
            color: C.ink,
            width: 90,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {confidence}%
        </span>
        <span
          style={{
            flex: 1,
            height: 12,
            borderRadius: 99,
            background: C.cream2,
            border: `1px solid ${C.line}`,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "block",
              width: `${84 * confBar}%`,
              height: "100%",
              background: C.sun,
            }}
          />
        </span>
      </div>

      <div
        style={{
          height: 2,
          background: C.line,
          margin: "22px 0 18px",
        }}
      />

      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.ink3,
          marginBottom: 12,
        }}
      >
        Evidence trail
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {EVIDENCE.map((e, i) => {
          const p = eased(frame, 232 + i * 9, 254 + i * 9);
          return (
            <span
              key={e}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 8}px)`,
                padding: "9px 18px",
                borderRadius: RADIUS.pill,
                background: C.cream,
                border: `2px solid ${C.line}`,
                fontFamily: BODY,
                fontSize: 21,
                fontWeight: 600,
                color: C.ink2,
              }}
            >
              {e}
            </span>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 22px",
            borderRadius: RADIUS.pill,
            background: `${C.red}14`,
            border: `2px solid ${C.red}`,
            color: C.red,
            fontFamily: DISPLAY,
            fontSize: 23,
            fontWeight: 600,
            opacity: eased(frame, 288, 314),
          }}
        >
          <IconLock size={22} color={C.red} stroke={2.2} />
          Verification status: pending human review
        </span>
      </div>
    </div>
  );
};

const BeatModules: React.FC<{ dur: number }> = ({ dur }) => (
  <Beat dur={dur}>
    <div style={{ position: "absolute", left: 110, top: 120, width: 1300 }}>
      <Rise delay={0} y={12}>
        <Eyebrow>the risk engine</Eyebrow>
      </Rise>
      <Rise delay={7} y={22} style={{ marginTop: 18 }}>
        <Title size={54}>
          Six hazard modules combine into one score, one band and one confidence
          figure.
        </Title>
      </Rise>
    </div>
    <ModuleFlow />
    {MODULES.map((m, i) => (
      <ModuleRow key={m.name} m={m} index={i} />
    ))}
    <CompositePanel />
  </Beat>
);

// ─────────────────────────── beat B: the four bands ───────────────────────────

type Band = {
  name: string;
  label: string;
  range: string;
  meaning: string;
  action: string;
  color: string;
  gated: boolean;
};

const BANDS: Band[] = [
  {
    name: "GREEN",
    label: "Normal",
    range: "score 0 – 24",
    meaning:
      "Conditions are within the expected range. Standard seasonal health guidance applies.",
    action: "Seasonal advisory to schools and parents",
    color: C.leaf,
    gated: false,
  },
  {
    name: "YELLOW",
    label: "Watch",
    range: "score 25 – 54",
    meaning:
      "Conditions are approaching risk thresholds. Preparedness actions are recommended.",
    action: "Preparedness checklist to school and CHW",
    color: C.sun,
    gated: false,
  },
  {
    name: "ORANGE",
    label: "Prepare",
    range: "score 55 – 79",
    meaning:
      "A risk threshold has been breached. Immediate preparedness actions are required.",
    action: "Action alert to school, CHW and health facility",
    color: C.heat,
    gated: true,
  },
  {
    name: "RED",
    label: "Act",
    range: "score 80 – 100",
    meaning:
      "Critical risk. Immediate action is required. Human review is mandatory before distribution.",
    action: "Critical alert with human review gate",
    color: C.red,
    gated: true,
  },
];

const BandCard: React.FC<{ band: Band; index: number }> = ({ band, index }) => {
  const frame = useCurrentFrame();
  const delay = 26 + index * 12;
  const p = eased(frame, delay, delay + 24);
  const lock = eased(frame, delay + 30, delay + 52);

  return (
    <div
      style={{
        flex: 1,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        background: C.paper,
        border: `2px solid ${C.line}`,
        borderTop: `10px solid ${band.color}`,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.lift,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 38,
          fontWeight: 600,
          color: band.color,
          letterSpacing: "0.02em",
        }}
      >
        {band.name}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 30,
          fontWeight: 500,
          color: C.ink,
          marginTop: -2,
        }}
      >
        {band.label}
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontSize: 19,
          fontWeight: 700,
          color: C.ink3,
          marginTop: 8,
          letterSpacing: "0.04em",
        }}
      >
        {band.range}
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontSize: 21,
          lineHeight: 1.4,
          color: C.ink2,
          marginTop: 16,
        }}
      >
        {band.meaning}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 18 }}>
        <div
          style={{
            background: `${band.color}14`,
            border: `2px solid ${band.color}55`,
            borderRadius: RADIUS.md,
            padding: "12px 14px",
            fontFamily: BODY,
            fontSize: 19,
            fontWeight: 700,
            color: C.ink,
            lineHeight: 1.3,
          }}
        >
          {band.action}
        </div>
        {band.gated ? (
          <div
            style={{
              marginTop: 12,
              opacity: lock,
              transform: `translateY(${(1 - lock) * 8}px)`,
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontFamily: DISPLAY,
              fontSize: 18,
              fontWeight: 600,
              color: band.color,
            }}
          >
            <IconLock size={19} color={band.color} stroke={2.2} />
            Human review required
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BeatBands: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const closer = eased(frame, 150, 182);

  return (
    <Beat dur={dur}>
      <div style={{ position: "absolute", left: 110, top: 118, width: 1500 }}>
        <Rise delay={0} y={10}>
          <Eyebrow>the four bands</Eyebrow>
        </Rise>
        <Rise delay={6} y={20} style={{ marginTop: 16 }}>
          <Title size={52}>
            One scale across every hazard — and each band names its own action.
          </Title>
        </Rise>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 356,
          display: "flex",
          gap: 26,
        }}
      >
        {BANDS.map((b, i) => (
          <BandCard key={b.name} band={b} index={i} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 66,
          textAlign: "center",
          opacity: closer,
          transform: `translateY(${interpolate(closer, [0, 1], [14, 0])}px)`,
          fontFamily: HAND,
          fontSize: 48,
          fontWeight: 700,
          color: C.heat,
        }}
      >
        ORANGE and RED never issue themselves.
      </div>
    </Beat>
  );
};

// ─────────────────────────── scene ───────────────────────────

const BEAT_A = 330;

export const S4Engine: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur} style={{ padding: 0 }}>
    <Sequence from={0} durationInFrames={BEAT_A} layout="none">
      <BeatModules dur={BEAT_A} />
    </Sequence>
    <Sequence from={BEAT_A} durationInFrames={dur - BEAT_A} layout="none">
      <BeatBands dur={dur - BEAT_A} />
    </Sequence>
  </Scene>
);
