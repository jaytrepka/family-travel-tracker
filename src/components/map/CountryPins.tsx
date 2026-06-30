"use client";

import React from "react";

interface CountryPinsProps {
  /** Ordered list of person hex colors to render as pins */
  colors: string[];
  /** Scale factor — use smaller values when zoomed out */
  scale?: number;
}

// Classic map-pin shape: teardrop pointing down at (0,0)
// The circle center is at (0, -10), radius 5 → pin height ≈ 15px
function Pin({ color, x = 0 }: { color: string; x?: number }) {
  return (
    <g transform={`translate(${x}, 0)`} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
      {/* Teardrop body */}
      <path
        d="M0,0 C-5,-4 -6,-12 0,-14 C6,-12 5,-4 0,0"
        fill={color}
        stroke="white"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Inner highlight dot */}
      <circle cx="0" cy="-9" r="2.5" fill="white" opacity="0.55" />
    </g>
  );
}

// X-offsets so pins of different counts don't overlap (each pin ~10px wide)
const OFFSETS: Record<number, number[]> = {
  1: [0],
  2: [-6, 6],
  3: [-10, 0, 10],
  4: [-14, -4, 4, 14],
};

export default function CountryPins({ colors, scale = 1 }: CountryPinsProps) {
  if (colors.length === 0) return null;
  const n = Math.min(colors.length, 4);
  const offsets = OFFSETS[n];

  return (
    <g transform={`scale(${scale})`}>
      {colors.slice(0, 4).map((color, i) => (
        <Pin key={i} color={color} x={offsets[i]} />
      ))}
    </g>
  );
}
