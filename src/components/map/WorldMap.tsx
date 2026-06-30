"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { CountryWithVisitors, MapFilters } from "@/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Family color when multiple/all people are selected
const FAMILY_COLOR = "#6366F1"; // indigo-500

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
  "faeroe is.": "faroe islands",
  "bosnia and herz.": "bosnia and herzegovina",
  "eq. guinea": "equatorial guinea",
  "swaziland": "eswatini",
  "myanmar": "myanmar",
  "united states of america": "united states",
  "u.s. virgin is.": "us virgin islands",
  "dominican rep.": "dominican republic",
  "solomon is.": "solomon islands",
  "timor-leste": "timor-leste",
  "e. timor": "timor-leste",
  "n. cyprus": "northern cyprus",
};

interface WorldMapProps {
  countries: CountryWithVisitors[];
  filters: MapFilters;
  selectedCountryCode: string | null;
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

  const nameToCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of countries) {
      map.set(c.name.toLowerCase(), c.code);
    }
    return map;
  }, [countries]);

  // Determine if exactly one person is selected
  const singlePersonId = useMemo(() => {
    if (filters.personIds.length === 1) return filters.personIds[0];
    return null;
  }, [filters.personIds]);

  // alpha-3 code → fill color to render
  const countryFillMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of countries) {
      // Continent filter
      if (filters.continents.length > 0 && !filters.continents.includes(c.continent)) continue;

      if (singlePersonId) {
        // Single person mode: only color countries that person visited, use their color
        const idx = c.visitorIds.indexOf(singlePersonId);
        if (idx !== -1) {
          map.set(c.code, c.visitorColors[idx]);
        }
      } else {
        // Multiple/all people: color any country visited by any selected person
        const hasVisitor = c.visitorIds.some((id) => filters.personIds.includes(id));
        if (hasVisitor) {
          map.set(c.code, FAMILY_COLOR);
        }
      }
    }
    return map;
  }, [countries, filters, singlePersonId]);

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
                const fillColor = code ? countryFillMap.get(code) : undefined;
                const isSelected = code !== "" && selectedCountryCode === code;
                const isVisited = Boolean(fillColor);

                // Selected country overrides to a lighter tint of its fill
                const baseFill = isSelected
                  ? "#C7D2FE"
                  : fillColor ?? "#D1D5DB";

                const hoverFill = isVisited || isSelected ? "#A5B4FC" : "#9CA3AF";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={baseFill}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", cursor: "pointer" },
                      hover: { outline: "none", fill: hoverFill, cursor: "pointer" },
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
