/**
 * Scene 7 (95–110s) — The action chain, landing on Minutes of Protection.
 *
 * The seven lifecycle states are the AlertStatus enum in backend/app/models.py:
 * created → reviewed → issued → acknowledged → action_started →
 * action_completed → closed. Each node fills in turn, with a caption below
 * describing the stage that has just become active.
 *
 * The scene then lands on the signature metric. The worked figure is the
 * document's own example and is labelled illustrative on screen.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { BODY, C, DISPLAY, HAND, RADIUS, SHADOW } from "../theme";
import {
  Body,
  Eyebrow,
  IllustrativeTag,
  Rise,
  Scene,
  Title,
  eased,
  useCountUp,
} from "../ui";

const STAGES = [
  {
    name: "Created",
    caption:
      "The risk engine generates the alert with its evidence and confidence score.",
  },
  {
    name: "Reviewed",
    caption:
      "An authorised team member reviews every ORANGE and RED alert before it is issued.",
  },
  {
    name: "Issued",
    caption: "The alert is distributed to all relevant actors simultaneously.",
  },
  {
    name: "Acknowledged",
    caption: "School, CHW and health facility confirm they have received it.",
  },
  {
    name: "Action started",
    caption: "The actor confirms the preparedness action has begun.",
  },
  {
    name: "Action completed",
    caption: "The actor confirms the action is done and records the outcome.",
  },
  {
    name: "Closed",
    caption: "The alert is closed, and the outcome data feeds back into the model.",
  },
];

const RAIL_Y = 336;
const FIRST_X = 190;
const LAST_X = 1730;
const STEP = (LAST_X - FIRST_X) / (STAGES.length - 1);
const NODE_R = 25;

const STAGE_START = 26;
const STAGE_EVERY = 31;
const stageAt = (i: number) => STAGE_START + i * STAGE_EVERY;

const Chain: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {/* The empty rail. */}
      <line
        x1={FIRST_X}
        y1={RAIL_Y}
        x2={LAST_X}
        y2={RAIL_Y}
        stroke={C.line}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={eased(frame, 14, 40)}
      />

      {/* Segments fill as each stage is reached. */}
      {STAGES.slice(0, -1).map((s, i) => {
        const p = eased(frame, stageAt(i) + 8, stageAt(i + 1));
        return (
          <line
            key={s.name}
            x1={FIRST_X + i * STEP}
            y1={RAIL_Y}
            x2={FIRST_X + i * STEP + STEP * p}
            y2={RAIL_Y}
            stroke={C.leaf}
            strokeWidth={8}
            strokeLinecap="round"
          />
        );
      })}

      {STAGES.map((s, i) => {
        const x = FIRST_X + i * STEP;
        const arrive = eased(frame, stageAt(i), stageAt(i) + 16);
        const done = eased(frame, stageAt(i) + 18, stageAt(i) + 32);
        const isActive = arrive > 0 && done < 1;
        const fill =
          done > 0.5 ? C.leaf : arrive > 0.5 ? C.heat : C.paper;
        const stroke = done > 0.5 ? C.leaf : arrive > 0.5 ? C.heat : C.line2;
        const halo = isActive ? 1 - done : 0;

        return (
          <g key={s.name}>
            {halo > 0 ? (
              <circle
                cx={x}
                cy={RAIL_Y}
                r={NODE_R + 8 + halo * 12}
                fill="none"
                stroke={C.heat}
                strokeWidth={3}
                opacity={halo * 0.5}
              />
            ) : null}
            <circle
              cx={x}
              cy={RAIL_Y}
              r={NODE_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={4}
            />
            {done > 0.5 ? (
              <path
                d={`M ${x - 10} ${RAIL_Y} l 7 8 l 13 -15`}
                fill="none"
                stroke={C.paper}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={done}
              />
            ) : null}
            <text
              x={x}
              y={RAIL_Y + 62}
              textAnchor="middle"
              fontFamily={DISPLAY}
              fontSize={23}
              fontWeight={600}
              fill={arrive > 0.5 ? C.ink : C.ink3}
              opacity={0.35 + arrive * 0.65}
            >
              {s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 428,
        height: 76,
        textAlign: "center",
      }}
    >
      {STAGES.map((s, i) => {
        const start = stageAt(i);
        const end = stageAt(i + 1);
        const isLast = i === STAGES.length - 1;
        const opacity =
          eased(frame, start + 2, start + 14) -
          (isLast ? eased(frame, start + 74, start + 92) : eased(frame, end - 8, end + 4));
        if (opacity <= 0) return null;
        return (
          <div
            key={s.name}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              opacity,
              fontFamily: BODY,
              fontSize: 27,
              fontWeight: 600,
              color: C.ink2,
            }}
          >
            {s.caption}
          </div>
        );
      })}
    </div>
  );
};

const MinutesOfProtection: React.FC = () => {
  const frame = useCurrentFrame();
  const p = eased(frame, 268, 300);
  const children = useCountUp(3840, 306, 52);
  const hours = useCountUp(4.2, 330, 44, 1);

  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 548,
        display: "flex",
        gap: 46,
        alignItems: "stretch",
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <div style={{ flex: 1.05 }}>
        <div
          style={{
            fontFamily: HAND,
            fontSize: 44,
            fontWeight: 700,
            color: C.heat,
            transform: "rotate(-1.2deg)",
            transformOrigin: "left center",
          }}
        >
          the signature metric
        </div>
        <Title size={68} style={{ marginTop: 10, letterSpacing: "-0.03em" }}>
          Minutes of Protection
        </Title>
        <Body size={26} style={{ marginTop: 18, maxWidth: 780 }}>
          The number of children who received a protective action{" "}
          <b style={{ color: C.ink }}>before</b> climate exposure — and how far
          in advance that protection arrived.
        </Body>
        <Body size={22} style={{ marginTop: 16, maxWidth: 780, color: C.ink3 }}>
          The chain above is what makes the figure measurable rather than asserted.
        </Body>
      </div>

      <div
        style={{
          flex: 1,
          background: C.paper,
          border: `3px solid ${C.heat}`,
          borderRadius: RADIUS.xxl,
          boxShadow: SHADOW.big,
          padding: "30px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 96,
              fontWeight: 600,
              color: C.heat,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {children}
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 34,
              fontWeight: 500,
              color: C.ink,
            }}
          >
            children
          </span>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 25,
            fontWeight: 600,
            color: C.ink2,
            marginTop: 8,
          }}
        >
          received heat protection actions
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            marginTop: 18,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 62,
              fontWeight: 600,
              color: C.ink,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {hours} hours
          </span>
          <span
            style={{
              fontFamily: BODY,
              fontSize: 24,
              fontWeight: 700,
              color: C.ink2,
            }}
          >
            before peak temperature, on average
          </span>
        </div>
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
          <IllustrativeTag>
            Illustrative — the example given in the programme document
          </IllustrativeTag>
        </div>
      </div>
    </div>
  );
};

export const S7Chain: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur} style={{ padding: 0 }}>
    <div style={{ position: "absolute", left: 110, top: 112, width: 1500 }}>
      <Rise delay={0} y={10}>
        <Eyebrow>the action chain</Eyebrow>
      </Rise>
      <Rise delay={6} y={18} style={{ marginTop: 14 }}>
        <Title size={46}>
          Every alert is tracked from creation to close — a measurable
          early-warning-to-early-action chain.
        </Title>
      </Rise>
    </div>

    <Chain />
    <Caption />
    <MinutesOfProtection />
  </Scene>
);
