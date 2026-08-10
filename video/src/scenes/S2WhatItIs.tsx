/**
 * Scene 2 (15–25s) — What ClimaSchool AI is.
 *
 * The definition, the operating principle as a chain, and — given the audience
 * is funders and government partners — an equally prominent statement of what
 * the platform is deliberately not.
 *
 * Wording is taken from the "Core Definition" and "System positioning" sections
 * of the programme document.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { IconCheck, IconCross } from "../icons";
import { BODY, C, DISPLAY, RADIUS, SHADOW } from "../theme";
import { Body, Card, Eyebrow, Rise, Scene, Title, eased } from "../ui";

const PRINCIPLE: { word: string; color: string }[] = [
  { word: "Predict", color: C.sky },
  { word: "Prepare", color: C.sun },
  { word: "Act", color: C.heat },
  { word: "Protect", color: C.leaf },
  { word: "Learn", color: C.plum },
];

const IS_NOT = [
  "a government health information system",
  "a clinical diagnostic tool",
  "a replacement for DHIS2 or Ghana Health Service systems",
];

const IS = [
  "an independent, interoperable decision-support layer",
  "the intelligence and early-action layer around the child",
  "a complement to the health and education systems already in place",
];

const CHAIN_DELAY = 62;
const CHAIN_GAP = 9;

const Principle: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {PRINCIPLE.map((step, i) => {
        const p = eased(frame, CHAIN_DELAY + i * CHAIN_GAP, CHAIN_DELAY + i * CHAIN_GAP + 20);
        const arrow = eased(
          frame,
          CHAIN_DELAY + i * CHAIN_GAP + 12,
          CHAIN_DELAY + i * CHAIN_GAP + 26,
        );
        return (
          <React.Fragment key={step.word}>
            {i > 0 ? (
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 30,
                  fontWeight: 600,
                  color: C.ink3,
                  opacity: arrow,
                  transform: `translateX(${(1 - arrow) * -8}px)`,
                }}
              >
                →
              </span>
            ) : null}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 30px",
                borderRadius: RADIUS.pill,
                background: C.paper,
                border: `2px solid ${step.color}`,
                boxShadow: SHADOW.soft,
                fontFamily: DISPLAY,
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: C.ink,
                opacity: p,
                transform: `translateY(${(1 - p) * 14}px) scale(${0.94 + p * 0.06})`,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: step.color,
                  display: "block",
                }}
              />
              {step.word}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Panel: React.FC<{
  heading: string;
  items: string[];
  positive: boolean;
  delay: number;
}> = ({ heading, items, positive, delay }) => (
  <Rise delay={delay} y={26} style={{ flex: 1 }}>
    <Card
      accent={positive ? C.heat : C.line2}
      pad={30}
      style={{
        height: 268,
        background: positive ? C.paper : "rgba(255,255,255,0.62)",
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: positive ? C.heat : C.ink3,
          marginBottom: 20,
        }}
      >
        {heading}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item, i) => (
          <Rise key={item} delay={delay + 10 + i * 7} y={10}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ marginTop: 2, flexShrink: 0 }}>
                {positive ? (
                  <IconCheck size={26} color={C.leaf} />
                ) : (
                  <IconCross size={26} color={C.ink3} />
                )}
              </span>
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: 24,
                  lineHeight: 1.32,
                  fontWeight: positive ? 600 : 400,
                  color: positive ? C.ink : C.ink2,
                }}
              >
                {item}
              </span>
            </div>
          </Rise>
        ))}
      </div>
    </Card>
  </Rise>
);

export const S2WhatItIs: React.FC<{ dur: number }> = ({ dur }) => (
  <Scene dur={dur}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 22,
      }}
    >
      <Rise delay={0} y={12}>
        <Eyebrow>what it is</Eyebrow>
      </Rise>

      <Rise delay={7} y={26}>
        <Title size={58} style={{ maxWidth: 1420 }}>
          A child-centred climate-health intelligence and{" "}
          <span style={{ color: C.heat }}>early-action platform</span>.
        </Title>
      </Rise>

      <Rise delay={22} y={18}>
        <Body size={26} style={{ maxWidth: 1280 }}>
          It converts climate, environmental, school, community and health
          information into predictive risk insights, early warnings and
          role-specific actions — connecting schools, families, community health
          workers, health facilities and authorised institutional stakeholders.
        </Body>
      </Rise>

      <div style={{ marginTop: 14 }}>
        <Principle />
      </div>

      <div
        style={{
          display: "flex",
          gap: 36,
          width: "100%",
          maxWidth: 1560,
          marginTop: 26,
          textAlign: "left",
        }}
      >
        <Panel
          heading="ClimaSchool AI is not"
          items={IS_NOT}
          positive={false}
          delay={128}
        />
        <Panel heading="ClimaSchool AI is" items={IS} positive delay={152} />
      </div>
    </div>
    <Footnote dur={dur} />
  </Scene>
);

const Footnote: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = eased(frame, 210, 240);
  void dur;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 44,
        textAlign: "center",
        opacity: p,
        fontFamily: BODY,
        fontSize: 22,
        fontWeight: 600,
        color: C.ink3,
      }}
    >
      It never says &ldquo;there is an outbreak&rdquo;. It says climate and
      available indicators suggest elevated risk, and public-health verification
      is recommended.
    </div>
  );
};
