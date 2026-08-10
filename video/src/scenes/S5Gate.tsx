/**
 * Scene 5 (60–75s) — The AI safety gate.
 *
 * The trust moment of the film, so it is given room and a slow hand. A RED
 * alert travels the five stations of the safety gate, a barrier drops in front
 * of it, and it does not move again until a named human has approved it.
 *
 * The five stations are the AI Safety Gate table from the programme document.
 * The reviewer fields are the real ones on the Alert model in
 * backend/app/models.py: requires_human_review, reviewed_by, reviewed_at.
 */

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { IconCheck, IconLock } from "../icons";
import { BODY, C, DISPLAY, RADIUS, SHADOW } from "../theme";
import { Eyebrow, IllustrativeTag, Rise, Scene, Title, eased } from "../ui";

const RAIL_Y = 650;
const RAIL_FROM = 200;
const RAIL_TO = 1730;

const STATIONS = [
  { x: 250, label: "AI generates\nalert" },
  { x: 590, label: "Safety rules\ncheck" },
  { x: 960, label: "Human\nreview" },
  { x: 1330, label: "Approved\nmessage" },
  { x: 1680, label: "Distribution" },
];

const GATE_X = 960;
const GATE_W = 62;

const CARD_W = 330;
const CARD_H = 162;
const CARD_MID_Y = 512;

// Timing marks for the whole beat, in scene frames.
const T = {
  railIn: 30,
  cardIn: 58,
  cardArrive: 150,
  slamStart: 130,
  slamEnd: 148,
  reviewIn: 214,
  openStart: 300,
  openEnd: 324,
  departStart: 320,
  departEnd: 384,
  stampIn: 348,
  underline: 372,
};

const Rail: React.FC = () => {
  const frame = useCurrentFrame();
  const drawn = eased(frame, T.railIn, T.railIn + 30);

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <line
        x1={RAIL_FROM}
        y1={RAIL_Y}
        x2={RAIL_FROM + (RAIL_TO - RAIL_FROM) * drawn}
        y2={RAIL_Y}
        stroke={C.line2}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {STATIONS.map((s, i) => {
        const p = eased(frame, T.railIn + 8 + i * 7, T.railIn + 30 + i * 7);
        const isGate = i === 2;
        return (
          <g key={s.x} opacity={p}>
            <circle
              cx={s.x}
              cy={RAIL_Y}
              r={isGate ? 17 : 13}
              fill={C.paper}
              stroke={isGate ? C.red : C.line2}
              strokeWidth={isGate ? 5 : 4}
            />
            {s.label.split("\n").map((line, k) => (
              <text
                key={line}
                x={s.x}
                y={RAIL_Y + 46 + k * 30}
                textAnchor="middle"
                fontFamily={DISPLAY}
                fontSize={24}
                fontWeight={600}
                fill={isGate ? C.red : C.ink2}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

const AlertCard: React.FC = () => {
  const frame = useCurrentFrame();

  const approach = eased(frame, T.cardIn, T.cardArrive, Easing.bezier(0.2, 0.7, 0.3, 1));
  const depart = eased(frame, T.departStart, T.departEnd, Easing.bezier(0.5, 0, 0.25, 1));
  // A short damped bump the instant the alert meets the closed barrier.
  const since = frame - T.cardArrive;
  const jolt =
    since >= 0 ? -17 * Math.exp(-since / 7) * Math.cos(since / 2.1) : 0;

  const x = -220 + approach * 996 + jolt + depart * 874;
  const enter = eased(frame, T.cardIn, T.cardIn + 14);
  const stamp = eased(frame, T.stampIn, T.stampIn + 22);

  return (
    <div
      style={{
        position: "absolute",
        left: x - CARD_W / 2,
        top: CARD_MID_Y - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        opacity: enter,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: C.paper,
          border: `3px solid ${C.red}`,
          borderRadius: RADIUS.lg,
          boxShadow: SHADOW.lift,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span
          style={{
            alignSelf: "flex-start",
            padding: "5px 14px",
            borderRadius: RADIUS.pill,
            background: C.red,
            color: C.paper,
            fontFamily: DISPLAY,
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          RED — Act
        </span>
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 26,
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.15,
          }}
        >
          Extreme heat
        </span>
        <span
          style={{
            fontFamily: BODY,
            fontSize: 19,
            fontWeight: 600,
            color: C.ink3,
            marginTop: "auto",
          }}
        >
          score 91.7 · confidence 84%
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: -22,
          bottom: -30,
          opacity: stamp,
          transform: `rotate(-5deg) scale(${0.86 + stamp * 0.14})`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 16px",
          borderRadius: RADIUS.pill,
          background: C.leaf,
          color: C.paper,
          border: `3px solid ${C.paper}`,
          boxShadow: SHADOW.soft,
          fontFamily: DISPLAY,
          fontSize: 19,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        <IconCheck size={18} color={C.paper} stroke={3} />
        Verified by · timestamped
      </div>
    </div>
  );
};

const Barrier: React.FC = () => {
  const frame = useCurrentFrame();
  const closed = eased(frame, T.slamStart, T.slamEnd, Easing.bezier(0.3, 0, 0.15, 1));
  const open = eased(frame, T.openStart, T.openEnd, Easing.bezier(0.4, 0, 0.2, 1));
  const p = closed - open;
  if (p <= 0.001) return null;

  const travel = 560;
  const hazard = `repeating-linear-gradient(-45deg, ${C.red} 0 16px, #b32a21 16px 32px)`;

  return (
    <>
      {/* The room dims while the alert is held. */}
      <AbsoluteFill
        style={{
          background: "rgba(26,20,10,0.30)",
          opacity: p,
        }}
      />
      {[-1, 1].map((dir) => (
        <div
          key={dir}
          style={{
            position: "absolute",
            left: GATE_X - GATE_W / 2,
            top: dir === -1 ? 252 : RAIL_Y - 24,
            width: GATE_W,
            height: dir === -1 ? RAIL_Y - 252 - 20 : 370,
            transform: `translateY(${dir * travel * (1 - p)}px)`,
            background: hazard,
            borderRadius: 10,
            border: `3px solid ${C.paper}`,
            boxShadow: SHADOW.big,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: GATE_X - 265,
          top: 344,
          width: 530,
          opacity: eased(frame, T.slamEnd, T.slamEnd + 16) - open,
          transform: `scale(${0.92 + 0.08 * eased(frame, T.slamEnd, T.slamEnd + 16)})`,
          background: C.red,
          color: C.paper,
          border: `3px solid ${C.paper}`,
          borderRadius: RADIUS.pill,
          boxShadow: SHADOW.big,
          padding: "14px 0",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.08em",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <IconLock size={26} color={C.paper} stroke={2.4} />
          HUMAN REVIEW REQUIRED
        </span>
      </div>
    </>
  );
};

const REVIEW_FIELDS = [
  { label: "Reviewed by", value: "a named authorised reviewer" },
  { label: "Reviewed at", value: "timestamp recorded with the alert" },
  { label: "Status", value: "reviewed → issued" },
];

const ReviewPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const p = eased(frame, T.reviewIn, T.reviewIn + 26);

  return (
    <div
      style={{
        position: "absolute",
        left: 460,
        top: 792,
        width: 1000,
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
        background: C.paper,
        border: `3px solid ${C.leaf}`,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.big,
        padding: "22px 30px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: DISPLAY,
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.leaf,
          marginBottom: 14,
        }}
      >
        <IconCheck size={22} color={C.leaf} stroke={3} />
        Approved by a person
      </div>
      <div style={{ display: "flex", gap: 26 }}>
        {REVIEW_FIELDS.map((f, i) => {
          const fp = eased(frame, T.reviewIn + 14 + i * 10, T.reviewIn + 36 + i * 10);
          return (
            <div key={f.label} style={{ flex: 1, opacity: fp }}>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.ink3,
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.ink,
                  marginTop: 4,
                  lineHeight: 1.25,
                }}
              >
                {f.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const S5Gate: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const underline = eased(frame, T.underline, T.underline + 34);

  return (
    <Scene dur={dur} style={{ padding: 0 }}>
      <div style={{ position: "absolute", left: 110, top: 112, width: 1500 }}>
        <Rise delay={0} y={10}>
          <Eyebrow>the ai safety gate</Eyebrow>
        </Rise>
        <Rise delay={6} y={20} style={{ marginTop: 16 }}>
          <Title size={54}>
            ORANGE and RED alerts{" "}
            <span style={{ position: "relative", color: C.heat }}>
              cannot be issued
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -6,
                  height: 6,
                  width: `${underline * 100}%`,
                  background: C.heat,
                  borderRadius: 99,
                  opacity: 0.9,
                }}
              />
            </span>{" "}
            without a named human reviewer approving them.
          </Title>
        </Rise>
        <Rise delay={18} y={14} style={{ marginTop: 18 }}>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 24,
              fontWeight: 600,
              color: C.ink2,
              maxWidth: 1400,
            }}
          >
            Automated rules screen every draft for clinical accuracy, appropriate
            language and scope boundaries. Then a person decides.
          </div>
        </Rise>
      </div>

      <Rail />
      <AlertCard />
      <Barrier />
      <ReviewPanel />

      <div style={{ position: "absolute", right: 110, top: 118 }}>
        <Rise delay={26} y={10}>
          <IllustrativeTag>Illustrative alert</IllustrativeTag>
        </Rise>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 52,
          textAlign: "center",
          opacity: eased(frame, 396, 424),
          fontFamily: BODY,
          fontSize: 22,
          fontWeight: 700,
          color: C.ink3,
        }}
      >
        Clinical and safeguarding decisions remain with trained professionals.
      </div>
    </Scene>
  );
};
