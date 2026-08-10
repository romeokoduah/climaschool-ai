/**
 * Shared motion and layout primitives.
 *
 * Every animation here is driven by useCurrentFrame(); there are no CSS
 * transitions or keyframe animations anywhere in this project, because they do
 * not render deterministically.
 */

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BODY, C, DISPLAY, HAND, MARGIN, RADIUS, SHADOW } from "./theme";

/** Crisp UI entrance: fast out of the gate, settling with no overshoot. */
export const ENTER = Easing.bezier(0.16, 1, 0.3, 1);
/** Balanced, hold-friendly move for slower editorial beats. */
export const EDITORIAL = Easing.bezier(0.45, 0, 0.55, 1);

export const eased = (
  frame: number,
  from: number,
  to: number,
  easing = ENTER,
): number =>
  interpolate(frame, [from, to], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Progress 0→1 for an entrance beginning at `delay`, `dur` frames long. */
export const useProgress = (delay = 0, dur = 22, easing = ENTER): number => {
  const frame = useCurrentFrame();
  return eased(frame, delay, delay + dur, easing);
};

// ─────────────────────────── scene shell ───────────────────────────

/**
 * Wraps a scene with a soft dissolve at both ends. Because the shared paper
 * background lives outside the sequences, the outgoing and incoming scenes
 * cross-dissolve over the same ground rather than blinking through black.
 */
export const Scene: React.FC<{
  dur: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ dur, children, style }) => {
  const frame = useCurrentFrame();
  const enter = eased(frame, 0, 14, EDITORIAL);
  const exit = eased(frame, dur - 14, dur, EDITORIAL);
  const opacity = enter - exit;
  // A whisper of scale so cuts feel like a camera settling, not a slide show.
  const scale = interpolate(enter, [0, 1], [1.012, 1]);

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        fontFamily: BODY,
        color: C.ink,
        padding: MARGIN,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ─────────────────────────── entrance helpers ───────────────────────────

export const Rise: React.FC<{
  delay?: number;
  dur?: number;
  y?: number;
  x?: number;
  from?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, dur = 24, y = 22, x = 0, from = 0, style, children }) => {
  const p = useProgress(delay, dur);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 1], [from, 1]),
        transform: `translate(${x * (1 - p)}px, ${y * (1 - p)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Staggered reveal: children enter one after another, `gap` frames apart. */
export const Stagger: React.FC<{
  delay?: number;
  gap?: number;
  y?: number;
  x?: number;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, gap = 6, y = 20, x = 0, style, itemStyle, children }) => (
  <div style={style}>
    {React.Children.map(children, (child, i) => (
      <Rise delay={delay + i * gap} y={y} x={x} style={itemStyle}>
        {child}
      </Rise>
    ))}
  </div>
);

// ─────────────────────────── typography ───────────────────────────

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
}> = ({ children, color = C.heat, size = 40 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: HAND,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1,
      color,
    }}
  >
    <span
      style={{
        width: 34,
        height: 5,
        borderRadius: 99,
        background: color,
        display: "block",
      }}
    />
    {children}
  </div>
);

export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 68, weight = 600, color = C.ink, style }) => (
  <h1
    style={{
      margin: 0,
      fontFamily: DISPLAY,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      color,
      ...style,
    }}
  >
    {children}
  </h1>
);

export const Body: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 28, color = C.ink2, weight = 400, style }) => (
  <p
    style={{
      margin: 0,
      fontFamily: BODY,
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1.45,
      color,
      ...style,
    }}
  >
    {children}
  </p>
);

/** Small honesty label used wherever the document gives a worked example. */
export const IllustrativeTag: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children = "Illustrative example", style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 16px",
      borderRadius: RADIUS.pill,
      border: `2px solid ${C.line2}`,
      background: C.cream2,
      fontFamily: DISPLAY,
      fontSize: 19,
      fontWeight: 500,
      color: C.ink3,
      ...style,
    }}
  >
    ★ {children}
  </span>
);

// ─────────────────────────── surfaces ───────────────────────────

export const Card: React.FC<{
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
  pad?: number;
}> = ({ children, accent, style, pad = 28 }) => (
  <div
    style={{
      background: C.paper,
      border: `2px solid ${accent ?? C.line}`,
      borderRadius: RADIUS.xl,
      boxShadow: SHADOW.soft,
      padding: pad,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  filled?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, color = C.ink2, filled = false, size = 20, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 18px",
      borderRadius: RADIUS.pill,
      border: `2px solid ${filled ? color : C.line2}`,
      background: filled ? color : C.paper,
      color: filled ? C.paper : color,
      fontFamily: DISPLAY,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

// ─────────────────────────── background ───────────────────────────

/**
 * The paper ground. Rendered once, outside every sequence, so it never blinks
 * between scenes. Warm cream with two very soft accent blooms and a faint grid,
 * matching the texture of the public site.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  // A single, extremely slow drift over the full two minutes — enough to keep
  // the frame alive under long-held type, far too slow to notice as motion.
  const drift = Math.sin((frame / 3600) * Math.PI * 2);

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 800px at ${18 + drift * 3}% ${12 + drift * 4}%, rgba(255,201,77,0.30), transparent 62%),
                       radial-gradient(1000px 900px at ${86 - drift * 3}% ${88 - drift * 3}%, rgba(255,106,61,0.20), transparent 60%),
                       radial-gradient(900px 700px at 50% 50%, rgba(94,155,255,0.07), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.5,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px),
                            linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(1400px 900px at 50% 45%, rgba(0,0,0,0.55), transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(1400px 900px at 50% 45%, rgba(0,0,0,0.55), transparent 78%)",
        }}
      />
      {/* Gentle vignette keeps the eye on the centre of the frame. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1500px 1000px at 50% 50%, transparent 55%, rgba(60,40,10,0.10))",
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────── geometry ───────────────────────────

export type Pt = { x: number; y: number };

/** Point on a cubic Bézier — used to run dots along connector paths. */
export const bezierPoint = (
  p0: Pt,
  p1: Pt,
  p2: Pt,
  p3: Pt,
  t: number,
): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

export const bezierPath = (p0: Pt, p1: Pt, p2: Pt, p3: Pt): string =>
  `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

/** Polar helper for the seasonal wheel; 0° points up. */
export const polar = (cx: number, cy: number, r: number, deg: number): Pt => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/** SVG arc path between two angles on a circle. */
export const arcPath = (
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string => {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
};

/** Count a number up to `value`, for figures that are explicitly illustrative. */
export const useCountUp = (
  value: number,
  delay: number,
  dur = 45,
  decimals = 0,
): string => {
  const p = useProgress(delay, dur, Easing.bezier(0.16, 1, 0.3, 1));
  const n = value * p;
  return decimals > 0
    ? n.toFixed(decimals)
    : Math.round(n).toLocaleString("en-GB");
};
