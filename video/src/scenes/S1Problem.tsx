/**
 * Scene 1 (0–15s) — The problem.
 *
 * Visual idea: Ghana's year as a wheel. Four coloured arcs draw themselves into
 * the ring while the matching seasons list itself on the left, so the viewer
 * sees the point before they finish reading it — the threat is not one hazard,
 * it rotates through four.
 *
 * Content is taken from the seasonal advisory framework in the programme
 * document (Part 2, seasons 1–4).
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BODY, C, DISPLAY, HAND, SEASON } from "../theme";
import { Body, Eyebrow, Rise, Scene, Title, arcPath, eased, polar } from "../ui";

const CX = 1425;
const CY = 512;
const R = 236;
const RING = 54;

type SeasonRow = {
  key: keyof typeof SEASON;
  name: string;
  months: string;
  hazard: string;
  /** Month index the arc starts on (0 = January) and how many months it spans. */
  startMonth: number;
  span: number;
};

const SEASONS: SeasonRow[] = [
  {
    key: "harmattan",
    name: "Harmattan",
    months: "November – February",
    hazard: "Dust, respiratory infection and the meningitis belt",
    startMonth: 10,
    span: 4,
  },
  {
    key: "dryheat",
    name: "Peak dry heat",
    months: "March – April",
    hazard: "Heat stroke, heat exhaustion and severe dehydration",
    startMonth: 2,
    span: 2,
  },
  {
    key: "firstrains",
    name: "First rains",
    months: "May – July",
    hazard: "Peak malaria transmission, flooding and cholera",
    startMonth: 4,
    span: 3,
  },
  {
    key: "secondrains",
    name: "Second rains",
    months: "August – October",
    hazard: "Continued malaria and persistent waterborne disease",
    startMonth: 7,
    span: 3,
  },
];

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const ROW_DELAY = 58;
const ROW_GAP = 34;

const Wheel: React.FC = () => {
  const frame = useCurrentFrame();
  const ringIn = eased(frame, 26, 56);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* The empty year, drawn first so the arcs have something to fill. */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={C.line}
          strokeWidth={RING}
          opacity={ringIn}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R + RING / 2}
          fill="none"
          stroke={C.line2}
          strokeWidth={1.5}
          opacity={ringIn * 0.7}
        />
        <circle
          cx={CX}
          cy={CY}
          r={R - RING / 2}
          fill="none"
          stroke={C.line2}
          strokeWidth={1.5}
          opacity={ringIn * 0.7}
        />

        {SEASONS.map((s, i) => {
          const start = s.startMonth * 30;
          const end = start + s.span * 30;
          const p = eased(frame, ROW_DELAY + i * ROW_GAP, ROW_DELAY + i * ROW_GAP + 34);
          return (
            <path
              key={s.key}
              d={arcPath(CX, CY, R, start + 1.2, end - 1.2)}
              fill="none"
              stroke={SEASON[s.key]}
              strokeWidth={RING}
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}

        {/* Month ticks and initials around the outside. */}
        {MONTHS.map((m, i) => {
          const angle = i * 30 + 15;
          const tickA = polar(CX, CY, R + RING / 2 + 8, angle);
          const tickB = polar(CX, CY, R + RING / 2 + 17, angle);
          const label = polar(CX, CY, R + RING / 2 + 38, angle);
          const appear = eased(frame, 30 + i * 2, 48 + i * 2);
          return (
            <g key={`${m}-${i}`} opacity={appear}>
              <line
                x1={tickA.x}
                y1={tickA.y}
                x2={tickB.x}
                y2={tickB.y}
                stroke={C.line2}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={DISPLAY}
                fontSize={22}
                fontWeight={600}
                fill={C.ink3}
              >
                {m}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: CX - 170,
          top: CY - 74,
          width: 340,
          textAlign: "center",
        }}
      >
        <Rise delay={44} y={12}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.ink3,
            }}
          >
            One school year
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 62,
              fontWeight: 600,
              color: C.ink,
              lineHeight: 1.1,
              marginTop: 4,
            }}
          >
            Four
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 25,
              fontWeight: 600,
              color: C.ink2,
              lineHeight: 1.2,
            }}
          >
            hazard profiles
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const S1Problem: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const closer = eased(frame, 300, 336);

  return (
    <Scene dur={dur} style={{ padding: 0 }}>
      <Wheel />

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 120,
          width: 920,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <Rise delay={0} y={14}>
          <Eyebrow>the problem</Eyebrow>
        </Rise>

        <Rise delay={8} y={26}>
          <Title size={60}>
            Every season brings a different threat to Ghana&rsquo;s children.
          </Title>
        </Rise>

        <Rise delay={22} y={20}>
          <Body size={26} style={{ maxWidth: 830 }}>
            Heat, harmattan dust, flood and the rains each carry their own
            climate-sensitive health risk — and each arrives on a schedule.
          </Body>
        </Rise>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
          {SEASONS.map((s, i) => (
            <Rise key={s.key} delay={ROW_DELAY + i * ROW_GAP} x={-26} y={0}>
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 99,
                    background: SEASON[s.key],
                    marginTop: 10,
                    flexShrink: 0,
                    boxShadow: `0 0 0 5px ${SEASON[s.key]}22`,
                  }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 31,
                        fontWeight: 600,
                        color: C.ink,
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.ink3,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {s.months}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: 23,
                      color: C.ink2,
                      marginTop: 2,
                    }}
                  >
                    {s.hazard}
                  </div>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 906,
          opacity: closer,
          transform: `translateY(${interpolate(closer, [0, 1], [16, 0])}px) rotate(-1.4deg)`,
          transformOrigin: "left center",
          fontFamily: HAND,
          fontSize: 52,
          fontWeight: 700,
          color: C.heat,
        }}
      >
        Four seasons. Four different threats.
      </div>
    </Scene>
  );
};
