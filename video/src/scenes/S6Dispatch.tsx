/**
 * Scene 6 (75–95s) — Dispatch.
 *
 * Visual idea: one alert at the top, five conduits fanning out, five actors
 * receiving five different instructions at the same moment. The point of the
 * scene is that the innovation is not the alert — it is the coordinated,
 * role-specific action that follows it.
 *
 * The actions are the flood ORANGE alert worked example from "The ClimaSchool
 * Early Action Chain" in the programme document, including the parent SMS
 * verbatim.
 */

import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import {
  IconChw,
  IconFacility,
  IconObserver,
  IconParent,
  IconSchool,
} from "../icons";
import { BODY, C, DISPLAY, HAND, RADIUS, SHADOW } from "../theme";
import {
  Eyebrow,
  IllustrativeTag,
  Rise,
  Scene,
  Title,
  bezierPath,
  eased,
} from "../ui";

const ALERT = { x: 1046, y: 118, w: 570, h: 196 };
const ALERT_OUT = { x: ALERT.x + ALERT.w / 2, y: ALERT.y + ALERT.h };

const CARD_TOP = 442;
const CARD_H = 472;
const CARD_W = 324;
const CARD_GAP = 20;
const CARD_LEFT = 110;

type Actor = {
  name: string;
  role: string;
  color: string;
  Icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  actions: string[];
  sms?: string;
  languages?: string[];
};

const ACTORS: Actor[] = [
  {
    name: "School",
    role: "Head teacher and school nurse",
    color: C.heat,
    Icon: IconSchool,
    actions: [
      "Check drainage",
      "Move learning materials to upper floors",
      "Confirm safe entrance and activate flood routes",
      "Inspect latrines for flood risk",
      "Check drinking water safety",
    ],
  },
  {
    name: "Parent",
    role: "SMS in four languages",
    color: C.sky,
    Icon: IconParent,
    actions: [],
    sms: "Heavy rainfall may affect routes to school tomorrow. Do not allow your child to cross floodwater. Use the safe route. Give your child boiled or sachet water only.",
    languages: ["English", "Twi", "Hausa", "Ga"],
  },
  {
    name: "CHW",
    role: "Community health worker",
    color: C.leaf,
    Icon: IconChw,
    actions: [
      "Visit vulnerable households",
      "Prioritise children with disabilities",
      "Check for diarrhoea cases",
      "Confirm household water safety",
      "Report emergencies by SMS keyword",
    ],
  },
  {
    name: "Health facility",
    role: "Health post serving the catchment",
    color: C.plum,
    Icon: IconFacility,
    actions: [
      "Check ORS supply",
      "Review referral contacts",
      "Activate flood-related diarrhoea preparedness",
      "Notify the district health directorate",
    ],
  },
  {
    name: "Institutional observer",
    role: "Read-only district dashboard",
    color: C.mint,
    Icon: IconObserver,
    actions: [
      "View affected school and facility map",
      "Review access and transport issues",
      "Coordinate district emergency response",
      "Note outstanding actions",
    ],
  },
];

const cardLeft = (i: number) => CARD_LEFT + i * (CARD_W + CARD_GAP);
const cardMidX = (i: number) => cardLeft(i) + CARD_W / 2;

const FAN_DELAY = 92;
const FAN_STEP = 11;
const CARD_DELAY = 124;
const CARD_STEP = 13;

const Fan: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = eased(frame, 68, 108, Easing.bezier(0.2, 0.8, 0.3, 1));

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {/* One outward pulse at the moment the alert is issued. */}
      {ring > 0 && ring < 1 ? (
        <circle
          cx={ALERT_OUT.x}
          cy={ALERT_OUT.y - ALERT.h / 2}
          r={40 + ring * 420}
          fill="none"
          stroke={C.heat}
          strokeWidth={3}
          opacity={(1 - ring) * 0.55}
        />
      ) : null}

      {ACTORS.map((a, i) => {
        const p0 = ALERT_OUT;
        const p3 = { x: cardMidX(i), y: CARD_TOP - 8 };
        const p1 = { x: p0.x, y: p0.y + 74 };
        const p2 = { x: p3.x, y: p3.y - 74 };
        const drawn = eased(frame, FAN_DELAY + i * FAN_STEP, FAN_DELAY + i * FAN_STEP + 30);
        return (
          <g key={a.name}>
            <path
              d={bezierPath(p0, p1, p2, p3)}
              fill="none"
              stroke={a.color}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
            />
            <circle
              cx={p3.x}
              cy={p3.y}
              r={6}
              fill={a.color}
              opacity={drawn > 0.98 ? 1 : 0}
            />
          </g>
        );
      })}
    </svg>
  );
};

const AlertCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = eased(frame, 24, 54);

  return (
    <div
      style={{
        position: "absolute",
        left: ALERT.x,
        top: ALERT.y,
        width: ALERT.w,
        height: ALERT.h,
        opacity: p,
        transform: `translateY(${(1 - p) * -20}px)`,
        background: C.paper,
        border: `3px solid ${C.heat}`,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.big,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            padding: "7px 18px",
            borderRadius: RADIUS.pill,
            background: C.heat,
            color: C.paper,
            fontFamily: DISPLAY,
            fontSize: 21,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          ORANGE — Prepare
        </span>
        <IllustrativeTag style={{ fontSize: 17, padding: "5px 12px" }}>
          Illustrative
        </IllustrativeTag>
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 38,
          fontWeight: 600,
          color: C.ink,
          lineHeight: 1.1,
        }}
      >
        Flood warning — risk high
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontSize: 21,
          fontWeight: 600,
          color: C.ink2,
          marginTop: "auto",
        }}
      >
        Reviewed, issued, and delivered to every actor simultaneously.
      </div>
    </div>
  );
};

const Bullet: React.FC<{ text: string; color: string; delay: number }> = ({
  text,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const p = eased(frame, delay, delay + 18);
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        opacity: p,
        transform: `translateX(${(1 - p) * -10}px)`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: color,
          marginTop: 9,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: BODY,
          fontSize: 19,
          lineHeight: 1.32,
          color: C.ink2,
          fontWeight: 600,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const ActorCard: React.FC<{ actor: Actor; index: number }> = ({
  actor,
  index,
}) => {
  const frame = useCurrentFrame();
  const delay = CARD_DELAY + index * CARD_STEP;
  const p = eased(frame, delay, delay + 24);
  const smsIn = eased(frame, delay + 26, delay + 50);

  return (
    <div
      style={{
        position: "absolute",
        left: cardLeft(index),
        top: CARD_TOP,
        width: CARD_W,
        height: CARD_H,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
        background: C.paper,
        border: `2px solid ${C.line}`,
        borderTop: `8px solid ${actor.color}`,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.lift,
        padding: 22,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: `${actor.color}1f`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <actor.Icon size={25} color={actor.color} stroke={2} />
        </span>
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 25,
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.1,
          }}
        >
          {actor.name}
        </span>
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontSize: 17,
          fontWeight: 700,
          color: C.ink3,
          marginTop: 8,
          marginBottom: 16,
          lineHeight: 1.25,
        }}
      >
        {actor.role}
      </div>

      {actor.sms ? (
        <div style={{ opacity: smsIn }}>
          <div
            style={{
              background: C.cream2,
              border: `2px solid ${C.line}`,
              borderRadius: 18,
              borderBottomLeftRadius: 6,
              padding: "13px 15px",
              fontFamily: BODY,
              fontSize: 17,
              lineHeight: 1.36,
              color: C.ink,
              fontWeight: 600,
            }}
          >
            {actor.sms}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginTop: 14,
            }}
          >
            {(actor.languages ?? []).map((l, i) => {
              const lp = eased(frame, delay + 52 + i * 7, delay + 68 + i * 7);
              return (
                <span
                  key={l}
                  style={{
                    opacity: lp,
                    padding: "5px 10px",
                    borderRadius: RADIUS.pill,
                    border: `2px solid ${C.line2}`,
                    background: C.paper,
                    fontFamily: DISPLAY,
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.ink2,
                  }}
                >
                  {l}
                </span>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: BODY,
              fontSize: 17,
              fontWeight: 700,
              color: C.ink3,
              lineHeight: 1.3,
            }}
          >
            SMS, USSD, WhatsApp or voice — no smartphone required.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {actor.actions.map((a, i) => (
            <Bullet
              key={a}
              text={a}
              color={actor.color}
              delay={delay + 26 + i * 8}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const S6Dispatch: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const closer = eased(frame, 420, 456);

  return (
    <Scene dur={dur} style={{ padding: 0 }}>
      <div style={{ position: "absolute", left: 110, top: 116, width: 820 }}>
        <Rise delay={0} y={10}>
          <Eyebrow>dispatch</Eyebrow>
        </Rise>
        <Rise delay={6} y={22} style={{ marginTop: 16 }}>
          <Title size={50}>One alert. Five actors. Five different actions.</Title>
        </Rise>
        <Rise delay={18} y={14} style={{ marginTop: 16 }}>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 23,
              fontWeight: 600,
              color: C.ink2,
              maxWidth: 760,
            }}
          >
            The innovation is not the alert. It is the coordinated, role-specific
            action that follows it.
          </div>
        </Rise>
      </div>

      <AlertCard />
      <Fan />

      {ACTORS.map((a, i) => (
        <ActorCard key={a.name} actor={a} index={i} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 936,
          textAlign: "center",
          opacity: closer,
          transform: `translateY(${(1 - closer) * 14}px) rotate(-0.8deg)`,
          fontFamily: HAND,
          fontSize: 46,
          fontWeight: 700,
          color: C.heat,
        }}
      >
        Everyone around the child, at the same moment.
      </div>
    </Scene>
  );
};
