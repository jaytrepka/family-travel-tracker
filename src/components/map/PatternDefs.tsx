"use client";

import React from "react";
import { buildPatternId } from "@/types";

interface PatternDefsProps {
  /** Unique sets of colors that need patterns (already deduped) */
  colorSets: string[][];
}

/**
 * Generates SVG <defs> with diagonal stripe patterns for each unique
 * combination of visitor colors.
 *
 * Strategy:
 *  1 color  → solid fill (no pattern needed, handled at render time)
 *  2 colors → 2 diagonal stripes of equal width
 *  3 colors → 3 diagonal stripes of equal width
 *  4 colors → 4 diagonal stripes of equal width
 *
 * The tile is 20×20, stripes run at 45°.
 */
export function PatternDefs({ colorSets }: PatternDefsProps) {
  return (
    <defs>
      {colorSets
        .filter((colors) => colors.length > 1)
        .map((colors) => {
          const id = buildPatternId(colors);
          const n = colors.length;
          const tileSize = 20;
          const stripeWidth = tileSize / n;

          return (
            <pattern
              key={id}
              id={id}
              patternUnits="userSpaceOnUse"
              width={tileSize}
              height={tileSize}
              patternTransform="rotate(45)"
            >
              {colors.map((color, i) => (
                <rect
                  key={i}
                  x={0}
                  y={i * stripeWidth}
                  width={tileSize}
                  height={stripeWidth}
                  fill={color}
                />
              ))}
            </pattern>
          );
        })}
    </defs>
  );
}

/** Returns the SVG fill value for a given set of colors */
export function getFill(colors: string[]): string {
  if (colors.length === 0) return "#D1D5DB"; // unvisited: gray-300
  if (colors.length === 1) return colors[0];
  return `url(#${buildPatternId(colors)})`;
}
