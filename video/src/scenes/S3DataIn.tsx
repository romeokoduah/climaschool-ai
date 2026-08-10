/**
 * Scene 3 (25–40s) — Data in.
 *
 * Visual idea: five labelled sources on the left, five curved conduits, and a
 * steady flow of particles travelling along them into the intelligence core.
 * The particles are positioned by evaluating the cubic Bézier in JavaScript on
 * each frame, so the motion is frame-accurate rather than CSS-driven.
 *
 * The five categories are the Data Sources Framework from the programme document.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  IconHandshake,
  IconSatellite,
  IconSensor,
  IconSms,
  IconVault,
} from "../icons";
import { BODY, C, DISPLAY, HAND, RADIUS, SHADOW } from "../theme";
import {
  Body,
  Eyebrow,
  Rise,
  Scene,
  Title,
  bezierPath,
  bezierPoint,
  eased,
} from "../ui";

const CARD_X = 110;
const CARD_W = 570;
const CARD_H = 106;
const CARD_GAP = 18;
const FIRST_TOP = 332;

const ENGINE = { x: 1272, y: 442, w: 500, h: 300 };
const ENGINE_IN = { x: ENGINE.x, y: ENGINE.y + ENGINE.h / 2 };

type Source = {
  title: string;
  detail: string;
  color: string;
  Icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
};

const SOURCES: Source[] = [
  {
    title: "Public data",
    detail:
      "Weather forecasts, satellite observation, rainfall, temperature, air quality and flood information",
    color: C.sky,
    Icon: IconSatellite,
  },
  {
    title: "Partner-provided data",
    detail:
      "Shared by health facilities, schools, NGOs and research institutions under formal data-sharing agreements",
    color: C.plum,
    Icon: IconHandshake,
  },
  {
    title: "Structured field reports",
    detail:
      "CHWs, teachers and school staff reporting through SMS keyword codes and structured digital forms",
    color: C.leaf,
    Icon: IconSms,
  },
  {
    title: "Environmental sensors",
    detail:
      "Classroom temperature, humidity, air quality and water-level readings at the pilot sites",
    color: C.mint,
    Icon: IconSensor,
  },
  {
    title: "Authorised institutional data",
    detail:
      "Selected datasets exchanged securely where a formal agreement exists",
    color: C.sun,
    Icon: IconVault,
  },
];

const cardTop = (i: number) => FIRST_TOP + i * (CARD_H + CARD_GAP);
const cardMid = (i: number) => cardTop(i) + CARD_H / 2;

const conduit = (i: number) => {
  const from = { x: CARD_X + CARD_W + 16, y: cardMid(i) };
  return {
    p0: from,
    p1: { x: from.x + 210, y: from.y },
    p2: { x: ENGINE_IN.x - 200, y: ENGINE_IN.y },
    p3: ENGINE_IN,
  };
};

const PATH_DELAY = 84;
const PATH_STEP = 15;
const FLOW_START = 128;

const Conduits: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {SOURCES.map((s, i) => {
        const { p0, p1, p2, p3 } = conduit(i);
        const drawn = eased(frame, PATH_DELAY + i * PATH_STEP, PATH_DELAY + i * PATH_STEP + 30);
        return (
          <path
            key={s.title}
            d={bezierPath(p0, p1, p2, p3)}
            fill="none"
            stroke={s.color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - drawn}
          />
        );
      })}

      {SOURCES.map((s, i) => {
        const { p0, p1, p2, p3 } = conduit(i);
        const alive = eased(frame, FLOW_START + i * PATH_STEP, FLOW_START + i * PATH_STEP + 20);
        if (alive <= 0) return null;
        // Three particles per conduit, evenly spaced in phase, each taking
        // 2.6 seconds to travel the full path.
        return [0, 1, 2].map((k) => {
          const cycle = 78;
          const raw = (frame - FLOW_START - i * 6) / cycle + k / 3;
          const t = raw - Math.floor(raw);
          const pt = bezierPoint(p0, p1, p2, p3, t);
          // Fade in off the source and out into the engine so nothing pops.
          const edge = Math.min(1, t / 0.12, (1 - t) / 0.14);
          return (
            <circle
              key={`${s.title}-${k}`}
              cx={pt.x}
              cy={pt.y}
              r={7}
              fill={s.color}
              opacity={alive * edge * 0.95}
            />
          );
        });
      })}
    </svg>
  );
};

const Engine: React.FC = () => {
  const frame = useCurrentFrame();
  const p = eased(frame, 56, 90);
  // A slow, shallow breath so the core reads as live rather than static.
  const pulse = 1 + 0.012 * Math.sin((frame / 30) * Math.PI * 0.9);

  return (
    <div
      style={{
        position: "absolute",
        left: ENGINE.x,
        top: ENGINE.y,
        width: ENGINE.w,
        height: ENGINE.h,
        opacity: p,
        transform: `scale(${(0.9 + p * 0.1) * pulse})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -18,
          borderRadius: RADIUS.xxl + 12,
          border: `2px solid ${C.heat}`,
          opacity: 0.22,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          background: C.paper,
          border: `3px solid ${C.heat}`,
          borderRadius: RADIUS.xxl,
          boxShadow: SHADOW.big,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 30,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.heat,
          }}
        >
          The intelligence core
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 42,
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.1,
          }}
        >
          Multi-hazard child
          <br />
          climate risk engine
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 21,
            fontWeight: 700,
            color: C.ink3,
          }}
        >
          Open-source · explainable · six hazard modules
        </div>
      </div>
    </div>
  );
};

export const S3DataIn: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const footer = eased(frame, 300, 336);

  return (
    <Scene dur={dur} style={{ padding: 0 }}>
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 110, top: 120, width: 1100 }}>
          <Rise delay={0} y={12}>
            <Eyebrow>data in</Eyebrow>
          </Rise>
          <Rise delay={8} y={24} style={{ marginTop: 20 }}>
            <Title size={54}>Five categories of data feed the engine.</Title>
          </Rise>
          <Rise delay={20} y={16} style={{ marginTop: 14 }}>
            <Body size={24} style={{ maxWidth: 1210 }}>
              Public and partner sources, the field, the classroom itself — and
              authorised institutional exchange.
            </Body>
          </Rise>
        </div>

        <Conduits />

        {SOURCES.map((s, i) => (
          <Rise
            key={s.title}
            delay={40 + i * 11}
            x={-34}
            y={0}
            style={{
              position: "absolute",
              left: CARD_X,
              top: cardTop(i),
              width: CARD_W,
              height: CARD_H,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: C.paper,
                border: `2px solid ${C.line}`,
                borderLeft: `6px solid ${s.color}`,
                borderRadius: RADIUS.lg,
                boxShadow: SHADOW.soft,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 22px",
              }}
            >
              <span
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: `${s.color}1f`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.Icon size={30} color={s.color} stroke={2} />
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontFamily: DISPLAY,
                    fontSize: 26,
                    fontWeight: 600,
                    color: C.ink,
                    lineHeight: 1.15,
                  }}
                >
                  {s.title}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: BODY,
                    fontSize: 19,
                    lineHeight: 1.3,
                    color: C.ink2,
                    marginTop: 3,
                  }}
                >
                  {s.detail}
                </span>
              </span>
            </div>
          </Rise>
        ))}

        <Engine />

        <div
          style={{
            position: "absolute",
            left: ENGINE.x - 40,
            top: ENGINE.y + ENGINE.h + 66,
            width: ENGINE.w + 80,
            textAlign: "center",
            opacity: footer,
          }}
        >
          <div
            style={{
              fontFamily: HAND,
              fontSize: 44,
              fontWeight: 700,
              color: C.heat,
              transform: "rotate(-1.2deg)",
            }}
          >
            Interoperability by design.
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 21,
              fontWeight: 600,
              color: C.ink2,
              marginTop: 8,
              lineHeight: 1.35,
            }}
          >
            Integration where authorised and feasible. No direct connection to
            government systems is required for the platform to generate value.
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
