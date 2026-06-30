"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import CountryPins from "./CountryPins";
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
                const colors = code ? (countryFillMap.get(code) ?? []) : [];
                const isSelected = code !== "" && selectedCountryCode === code;
                const isVisited = colors.length > 0;

                // Centroid for pin placement
                const centroid = geoCentroid(geo as unknown as GeoJSON.Feature) as [number, number];

                return (
                  <React.Fragment key={geo.rsmKey}>
                    {/* Country shape — neutral fill, subtle highlight for visited */}
                    <Geography
                      geography={geo}
                      fill={isSelected ? "#C7D2FE" : isVisited ? "#EEF2FF" : "#E5E7EB"}
                      stroke={isSelected ? "#4F46E5" : "#FFFFFF"}
                      strokeWidth={isSelected ? 1.5 : 0.5}
                      style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: { outline: "none", fill: isVisited ? "#C7D2FE" : "#D1D5DB", cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                      onClick={() => onCountryClick(code, geoName)}
                    />

                    {/* Pins rendered on top of the country shape */}
                    {isVisited && (
                      <Marker
                        coordinates={centroid}
                        onClick={() => onCountryClick(code, geoName)}
                      >
                        <CountryPins colors={colors} />
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
