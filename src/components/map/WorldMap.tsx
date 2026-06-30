"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { PatternDefs, getFill } from "./PatternDefs";
import { CountryWithVisitors, MapFilters } from "@/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  countries: CountryWithVisitors[];
  filters: MapFilters;
  selectedCountryCode: string | null;
  onCountryClick: (code: string) => void;
}

export default function WorldMap({
  countries,
  filters,
  selectedCountryCode,
  onCountryClick,
}: WorldMapProps) {
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 20],
    zoom: 1,
  });

  // Build lookup: countryCode -> filtered visitor colors
  const countryFillMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of countries) {
      // Apply continent filter
      if (filters.continents.length > 0 && !filters.continents.includes(c.continent)) continue;
      // Apply person filter: only keep colors of selected persons
      const filteredColors = c.visitorColors.filter((_, idx) =>
        filters.personIds.includes(c.visitorIds[idx])
      );
      if (filteredColors.length > 0) {
        map.set(c.code, filteredColors);
      }
    }
    return map;
  }, [countries, filters]);

  // Collect all unique color-sets to pre-generate SVG patterns
  const uniqueColorSets = useMemo(() => {
    const seen = new Set<string>();
    const sets: string[][] = [];
    for (const colors of countryFillMap.values()) {
      if (colors.length > 1) {
        const key = colors.join(",");
        if (!seen.has(key)) {
          seen.add(key);
          sets.push(colors);
        }
      }
    }
    return sets;
  }, [countryFillMap]);

  const handleMoveEnd = useCallback(
    (pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos),
    []
  );

  return (
    <div className="w-full h-full bg-sky-50 rounded-xl overflow-hidden shadow-inner">
      <ComposableMap
        projectionConfig={{ scale: 147, center: [0, 20] }}
        style={{ width: "100%", height: "100%" }}
      >
        <PatternDefs colorSets={uniqueColorSets} />
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: import("react-simple-maps").GeoFeature[] }) =>
              geographies.map((geo: import("react-simple-maps").GeoFeature) => {
                // world-atlas uses numeric ISO codes; we map via properties.name
                // react-simple-maps exposes ISO_A3 via geo.properties
                const rawCode = geo.properties?.["Alpha-3"] ?? geo.properties?.name;
                const code = String(rawCode ?? "");
                const colors = countryFillMap.get(code) ?? [];
                const isSelected = selectedCountryCode === code;
                const fill = getFill(colors);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isSelected ? "#1E3A5F" : "#FFFFFF"}
                    strokeWidth={isSelected ? 2 : 0.5}
                    style={{
                      default: { outline: "none", cursor: colors.length > 0 ? "pointer" : "default" },
                      hover: { outline: "none", filter: "brightness(0.85)", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => onCountryClick(code)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
