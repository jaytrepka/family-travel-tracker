"use client";

import React from "react";

interface CountryPinsProps {
  colors: string[];
}

/**
 * Compact colored dot indicators placed at a country's centroid.
 * Arranged to fit within even small countries at world-zoom:
 *   1 → single dot (r=3)
 *   2 → two dots side by side (r=2.2, ±3px)
 *   3 → triangle (r=2, top + bottom-left + bottom-right)
 *   4 → 2×2 grid (r=1.8, ±2.6px each axis)
 */
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-3, 0], [3, 0]],
  3: [[0, -2.8], [-3, 2], [3, 2]],
  4: [[-2.8, -2.8], [2.8, -2.8], [-2.8, 2.8], [2.8, 2.8]],
};

const DOT_RADII: Record<number, number> = { 1: 3, 2: 2.2, 3: 2, 4: 1.8 };

export default function CountryPins({ colors }: CountryPinsProps) {
  if (colors.length === 0) return null;
  const n = Math.min(colors.length, 4) as 1 | 2 | 3 | 4;
  const positions = DOT_POSITIONS[n];
  const r = DOT_RADII[n];

  return (
    <g>
      {colors.slice(0, 4).map((color, i) => (
        <circle
          key={i}
          cx={positions[i][0]}
          cy={positions[i][1]}
          r={r}
          fill={color}
          stroke="white"
          strokeWidth="0.8"
        />
      ))}
    </g>
  );
}
