/**
 * Hand-built geometric glyphs. No icon library — these are drawn to sit on the
 * same rounded, friendly grid as the rest of the brand, and to stay legible at
 * the small sizes they are used at.
 */

import React from "react";

type IconProps = { size?: number; color?: string; stroke?: number };

const Svg: React.FC<{ size: number; children: React.ReactNode }> = ({
  size,
  children,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </svg>
);

export const IconHeat: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="4.4" stroke={color} strokeWidth={stroke} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return (
        <line
          key={deg}
          x1={12 + Math.cos(r) * 7.3}
          y1={12 + Math.sin(r) * 7.3}
          x2={12 + Math.cos(r) * 9.8}
          y2={12 + Math.sin(r) * 9.8}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      );
    })}
  </Svg>
);

export const IconWater: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M12 2.6c3.6 4.3 6.2 7.6 6.2 10.6a6.2 6.2 0 0 1-12.4 0c0-3 2.6-6.3 6.2-10.6Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path
      d="M9 13.6c0 1.8 1.4 3.2 3.1 3.2"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconDisease: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="5.2" stroke={color} strokeWidth={stroke} />
    {[0, 60, 120, 180, 240, 300].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return (
        <g key={deg}>
          <line
            x1={12 + Math.cos(r) * 5.2}
            y1={12 + Math.sin(r) * 5.2}
            x2={12 + Math.cos(r) * 8.4}
            y2={12 + Math.sin(r) * 8.4}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <circle
            cx={12 + Math.cos(r) * 9.4}
            cy={12 + Math.sin(r) * 9.4}
            r="1.3"
            fill={color}
          />
        </g>
      );
    })}
  </Svg>
);

export const IconAir: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    {[7, 12, 17].map((y, i) => (
      <path
        key={y}
        d={`M3 ${y}c2.2-2 4.4 2 6.6 0s4.4 2 6.6 0 ${i === 1 ? "3.6 1.4 4.8 0.4" : "3.6-1.4 4.8-0.4"}`}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
      />
    ))}
  </Svg>
);

export const IconNutrition: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M3.2 11h17.6a8.8 8.8 0 0 1-8.8 8.4A8.8 8.8 0 0 1 3.2 11Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path
      d="M8.6 7.6c0-2 1.6-3.2 3.4-3.2s3.4 1.2 3.4 3.2"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconWellbeing: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M12 20.2S3.6 15.2 3.6 9.6A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 8.4 2.5c0 5.6-8.4 10.6-8.4 10.6Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconSchool: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M2.6 9.4 12 4.6l9.4 4.8L12 14.2 2.6 9.4Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path
      d="M6.4 11.4v4.9c0 1.5 2.5 2.9 5.6 2.9s5.6-1.4 5.6-2.9v-4.9"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconParent: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <circle cx="9" cy="7.2" r="3.1" stroke={color} strokeWidth={stroke} />
    <circle cx="16.8" cy="10.6" r="2.2" stroke={color} strokeWidth={stroke} />
    <path
      d="M3.2 19.6c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
    <path
      d="M16.4 15.2c2.3.3 4.1 2 4.4 4.4"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconChw: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <circle cx="12" cy="6.8" r="3.2" stroke={color} strokeWidth={stroke} />
    <path
      d="M5.2 20c0-3.6 3-6 6.8-6s6.8 2.4 6.8 6"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
    <path
      d="M12 15.6v4M10 17.6h4"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconFacility: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <rect
      x="4.2"
      y="6.4"
      width="15.6"
      height="13.4"
      rx="2.4"
      stroke={color}
      strokeWidth={stroke}
    />
    <path
      d="M12 10v6.2M8.9 13.1h6.2"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
    <path
      d="M8.6 6.4V4.2h6.8v2.2"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconObserver: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M2.4 12S6 6.4 12 6.4 21.6 12 21.6 12 18 17.6 12 17.6 2.4 12 2.4 12Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.9" stroke={color} strokeWidth={stroke} />
  </Svg>
);

export const IconSatellite: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={stroke} />
    <ellipse
      cx="12"
      cy="12"
      rx="9.6"
      ry="4.2"
      stroke={color}
      strokeWidth={stroke}
      transform="rotate(-24 12 12)"
    />
  </Svg>
);

export const IconHandshake: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M2.8 9.6 7 6.4l5 1.6 5-1.6 4.2 3.2"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
    <path
      d="M7 6.4v8.2c0 1.4 1.2 2.6 2.6 2.6h4.8c1.4 0 2.6-1.2 2.6-2.6V6.4"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconSms: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <path
      d="M4 5.4h16a1.6 1.6 0 0 1 1.6 1.6v8.4a1.6 1.6 0 0 1-1.6 1.6H9.4L4.8 20.4v-3.4H4A1.6 1.6 0 0 1 2.4 15.4V7A1.6 1.6 0 0 1 4 5.4Z"
      stroke={color}
      strokeWidth={stroke}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconSensor: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <rect
      x="9"
      y="2.8"
      width="6"
      height="12.6"
      rx="3"
      stroke={color}
      strokeWidth={stroke}
    />
    <circle cx="12" cy="17.8" r="3.4" stroke={color} strokeWidth={stroke} />
    <path
      d="M12 7v9"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const IconVault: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
}) => (
  <Svg size={size}>
    <rect
      x="3.4"
      y="10.2"
      width="17.2"
      height="10.4"
      rx="2.6"
      stroke={color}
      strokeWidth={stroke}
    />
    <path
      d="M7.4 10.2V7.6a4.6 4.6 0 0 1 9.2 0v2.6"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
    <circle cx="12" cy="15.4" r="1.7" fill={color} />
  </Svg>
);

export const IconLock: React.FC<IconProps> = IconVault;

export const IconCheck: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2.6,
}) => (
  <Svg size={size}>
    <path
      d="M4.6 12.6 9.6 17.6 19.4 6.8"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IconCross: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
  stroke = 2.6,
}) => (
  <Svg size={size}>
    <path
      d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </Svg>
);
