"use client";

import React from "react";
import { buildPatternId } from "@/types";

interface PatternDefsProps {
  colorSets: string[][];
}

/**
 * Generates SVG <defs> with stripe patterns for multi-visitor countries.
 *
 * Uses patternUnits="objectBoundingBox" so the pattern always scales
 * to the country's bounding box — regardless of how small it is on the map.
 *
 * Visual layout: equal horizontal bands (top-to-bottom, one per person).
 * 1 color  → solid fill, no pattern needed.
 * 2–4 colors → n equal horizontal bands, each a distinct person color.
 */
export function PatternDefs({ colorSets }: PatternDefsProps) {
  return (
    <defs>
      {colorSets
        .filter((colors) => colors.length > 1)
        .map((colors) => {
          const id = buildPatternId(colors);
          const n = colors.length;
          const bandHeight = 1 / n; // in objectBoundingBox units (0–1)

          return (
            <pattern
              key={id}
              id={id}
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              {colors.map((color, i) => (
                <rect
                  key={i}
                  x={0}
                  y={i * bandHeight}
                  width={1}
                  height={bandHeight}
                  fill={color}
                />
              ))}
            </pattern>
          );
        })}
    </defs>
  );
}

export function getFill(colors: string[]): string {
  if (colors.length === 0) return "#D1D5DB"; // unvisited: gray-300
  if (colors.length === 1) return colors[0];
  return `url(#${buildPatternId(colors)})`;
}
