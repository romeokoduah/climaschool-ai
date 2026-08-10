/**
 * Scene 8 (110–120s) — Close.
 *
 * Openness commitments, provenance, and the two confirmed pilot zones — one
 * primary school in each, as stated in the pilot ecosystem section. Nothing
 * here is scaled up beyond what the programme document commits to.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { BODY, C, DISPLAY, HAND, RADIUS, SHADOW } from "../theme";
import { Rise, Scene, eased } from "../ui";

const COMMITMENTS = [
  { label: "Open source — MIT licence", color: C.leaf },
  { label: "Advisory content — CC-BY 4.0", color: C.sky },
  { label: "Digital Public Good ready", color: C.plum },
];

const ZONES = [
  {
    tag: "Pilot zone 1",
    name: "Agbogbloshie / Korle Gonno",
    region: "Greater Accra Region",
    hazards: "Flooding · cholera · waterborne disease · urban heat · air pollution",
    color: C.sky,
  },
  {
    tag: "Pilot zone 2",
    name: "Tamale Metropolis",
    region: "Northern Region",
    hazards: "Extreme heat · harmattan · meningitis · malaria · water scarcity",
    color: C.heat,
  },
];

const PRINCIPLE = ["Predict", "Prepare", "Act", "Protect", "Learn"];

export const S8Close: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();

  return (
    <Scene dur={dur} style={{ padding: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 132,
        }}
      >
        <Rise delay={0} y={24}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 104,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              color: C.ink,
              lineHeight: 1,
            }}
          >
            ClimaSchool <span style={{ color: C.heat }}>AI</span>
          </div>
        </Rise>

        <Rise delay={16} y={16} style={{ marginTop: 16 }}>
          <div
            style={{
              fontFamily: HAND,
              fontSize: 50,
              fontWeight: 700,
              color: C.heat,
              transform: "rotate(-1.4deg)",
            }}
          >
            the weather forecast, but for child health
          </div>
        </Rise>

        <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
          {COMMITMENTS.map((c, i) => (
            <Rise key={c.label} delay={44 + i * 9} y={16}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 26px",
                  borderRadius: RADIUS.pill,
                  background: C.paper,
                  border: `2px solid ${c.color}`,
                  boxShadow: SHADOW.soft,
                  fontFamily: DISPLAY,
                  fontSize: 25,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                <span
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 99,
                    background: c.color,
                    display: "block",
                  }}
                />
                {c.label}
              </span>
            </Rise>
          ))}
        </div>

        <Rise delay={80} y={16} style={{ marginTop: 36 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 40,
              fontWeight: 500,
              color: C.ink,
            }}
          >
            Built in Ghana. Designed for Africa.
          </div>
        </Rise>

        <div style={{ display: "flex", gap: 34, marginTop: 34 }}>
          {ZONES.map((z, i) => (
            <Rise key={z.name} delay={98 + i * 12} y={26}>
              <div
                style={{
                  width: 690,
                  background: C.paper,
                  border: `2px solid ${C.line}`,
                  borderLeft: `8px solid ${z.color}`,
                  borderRadius: RADIUS.xl,
                  boxShadow: SHADOW.lift,
                  padding: "22px 28px",
                }}
              >
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: z.color,
                  }}
                >
                  {z.tag}
                </div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 34,
                    fontWeight: 600,
                    color: C.ink,
                    marginTop: 4,
                    lineHeight: 1.1,
                  }}
                >
                  {z.name}
                </div>
                <div
                  style={{
                    fontFamily: BODY,
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.ink3,
                    marginTop: 4,
                  }}
                >
                  {z.region} · one primary school confirmed
                </div>
                <div
                  style={{
                    fontFamily: BODY,
                    fontSize: 20,
                    color: C.ink2,
                    marginTop: 10,
                    lineHeight: 1.35,
                  }}
                >
                  {z.hazards}
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 52,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: eased(frame, 146, 178),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {PRINCIPLE.map((w, i) => (
            <React.Fragment key={w}>
              {i > 0 ? (
                <span style={{ color: C.ink3, fontFamily: DISPLAY, fontSize: 20 }}>
                  →
                </span>
              ) : null}
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.ink2,
                }}
              >
                {w}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 23,
            fontWeight: 700,
            color: C.ink3,
          }}
        >
          Eco-lution Consults · Ghana · www.climaschoolai.com
        </div>
      </div>
    </Scene>
  );
};
