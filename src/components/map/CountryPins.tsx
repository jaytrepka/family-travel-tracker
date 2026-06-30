"use client";

import React from "react";

interface CountryPinsProps {
  colors: string[];
}

// Tiny map-pin: teardrop ~7px tall, points down at (0,0)
function Pin({ color, x = 0 }: { color: string; x?: number }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <path
        d="M0,0 C-2.2,-1.8 -2.8,-6 0,-7 C2.8,-6 2.2,-1.8 0,0"
        fill={color}
        stroke="white"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="-4.5" r="1.3" fill="white" opacity="0.6" />
    </g>
  );
}

// Horizontal offsets so multiple pins sit side-by-side (each ~5px wide)
const OFFSETS: Record<number, number[]> = {
  1: [0],
  2: [-3.5, 3.5],
  3: [-6, 0, 6],
  4: [-8.5, -2.5, 2.5, 8.5],
};

export default function CountryPins({ colors }: CountryPinsProps) {
  if (colors.length === 0) return null;
  const n = Math.min(colors.length, 4) as 1 | 2 | 3 | 4;
  const offsets = OFFSETS[n];

  return (
    <g>
      {colors.slice(0, 4).map((color, i) => (
        <Pin key={i} color={color} x={offsets[i]} />
      ))}
    </g>
  );
}
