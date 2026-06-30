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

// world-atlas name → our DB country name (lowercase)
const TOPOJSON_ALIASES: Record<string, string> = {
  "czechia": "czech republic",
  "s. sudan": "south sudan",
  "w. sahara": "western sahara",
  "central african rep.": "central african republic",
  "congo": "republic of the congo",
  "dem. rep. congo": "democratic republic of the congo",
  "n. korea": "north korea",
  "s. korea": "south korea",
  "republic of korea": "south korea",
  "faeroe is.": "faroe islands",
  "bosnia and herz.": "bosnia and herzegovina",
  "eq. guinea": "equatorial guinea",
  "swaziland": "eswatini",
  "myanmar": "myanmar (burma)",
  "united states of america": "united states",
  "u.s. virgin is.": "us virgin islands",
  "dominican rep.": "dominican republic",
};

interface WorldMapProps {
  countries: CountryWithVisitors[];
  filters: MapFilters;
  selectedCountryCode: string | null;
  /** code = alpha-3 if in DB, "" if unknown. geoName is always the raw topojson name. */
  onCountryClick: (code: string, geoName: string) => void;
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

  // name (lowercase) → alpha-3 code
  const nameToCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of countries) {
      map.set(c.name.toLowerCase(), c.code);
    }
    return map;
  }, [countries]);

  // alpha-3 code → filtered visitor colors
  const countryFillMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of countries) {
      if (filters.continents.length > 0 && !filters.continents.includes(c.continent)) continue;
      const filteredColors = c.visitorColors.filter((_, idx) =>
        filters.personIds.includes(c.visitorIds[idx])
      );
      if (filteredColors.length > 0) {
        map.set(c.code, filteredColors);
      }
    }
    return map;
  }, [countries, filters]);

  const uniqueColorSets = useMemo(() => {
    const seen = new Set<string>();
    const sets: string[][] = [];
    for (const colors of countryFillMap.values()) {
      if (colors.length > 1) {
        const key = colors.join(",");
        if (!seen.has(key)) { seen.add(key); sets.push(colors); }
      }
    }
    return sets;
  }, [countryFillMap]);

  const handleMoveEnd = useCallback(
    (pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos),
    []
  );

  function resolveCode(geoName: string): string {
    const lower = geoName.toLowerCase();
    const aliased = TOPOJSON_ALIASES[lower] ?? lower;
    return nameToCode.get(aliased) ?? nameToCode.get(lower) ?? "";
  }

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
                const geoName = String(geo.properties?.name ?? "");
                const code = resolveCode(geoName);
                const colors = code ? (countryFillMap.get(code) ?? []) : [];
                const isSelected = code !== "" && selectedCountryCode === code;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFill(colors)}
                    stroke={isSelected ? "#1E3A5F" : "#FFFFFF"}
                    strokeWidth={isSelected ? 2 : 0.5}
                    style={{
                      default: { outline: "none", cursor: "pointer" },
                      hover: { outline: "none", filter: "brightness(0.85)", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => onCountryClick(code, geoName)}
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
