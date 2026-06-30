"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import MapFilters from "@/components/map/MapFilters";
import CountryPanel from "@/components/map/CountryPanel";
import { CountryWithVisitors, MapFilters as IMapFilters, PersonWithTrips } from "@/types";

const WorldMap = dynamic(() => import("@/components/map/WorldMap"), { ssr: false });

interface SelectedInfo {
  code: string;      // alpha-3 or "" if not in DB
  geoName: string;   // raw topojson name, always set
}

export default function WorldPage() {
  const [persons, setPersons] = useState<PersonWithTrips[]>([]);
  const [countries, setCountries] = useState<CountryWithVisitors[]>([]);
  const [filters, setFilters] = useState<IMapFilters>({ continents: [], personIds: [] });
  const [selected, setSelected] = useState<SelectedInfo | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/persons").then((r) => r.json()),
      fetch("/api/countries").then((r) => r.json()),
    ]).then(([p, c]) => {
      setPersons(p);
      setCountries(c);
      setFilters({ continents: [], personIds: p.map((x: PersonWithTrips) => x.id) });
      setLoading(false);
    });
  }, []);

  const selectedCountry = selected?.code
    ? countries.find((c) => c.code === selected.code) ?? null
    : null;

  const handleCountryClick = useCallback((code: string, geoName: string) => {
    setSelected((prev) => {
      if (prev?.code === code && prev?.geoName === geoName) return null; // deselect same
      return { code, geoName };
    });
  }, []);

  const searchResults =
    search.trim().length > 1
      ? countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : [];

  const leaderboard = persons
    .filter((p) => filters.personIds.includes(p.id))
    .map((p) => ({
      ...p,
      count: countries.filter((c) => c.visitorIds.includes(p.id)).length,
      visitedCountries: countries
        .filter((c) => c.visitorIds.includes(p.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌍</div>
          <p className="text-gray-500">Loading the world…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <MapFilters persons={persons} filters={filters} onChange={setFilters} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          <WorldMap
            countries={countries}
            filters={filters}
            selectedCountryCode={selected?.code ?? null}
            onCountryClick={handleCountryClick}
          />

          {/* Search */}
          <div className="absolute top-3 left-3 z-30 w-64">
            <input
              type="text"
              placeholder="🔍 Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 shadow bg-white/90 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searchResults.length > 0 && (
              <ul className="mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                {searchResults.slice(0, 6).map((c) => (
                  <li key={c.code}>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm flex items-center gap-2"
                      onClick={() => { setSelected({ code: c.code, geoName: c.name }); setSearch(""); }}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{c.continent.replace("_", " ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Country panel */}
          {selected && (
            <CountryPanel
              country={selectedCountry}
              geoName={selected.geoName}
              persons={persons}
              onClose={() => setSelected(null)}
            />
          )}
        </div>

        {/* Leaderboard sidebar */}
        <aside className="hidden lg:flex flex-col w-72 border-l border-gray-100 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">🏆 Leaderboard</h2>
            <p className="text-xs text-gray-400 mt-0.5">Countries visited</p>
          </div>
          <ul className="divide-y divide-gray-50">
            {leaderboard.map((person, i) => (
              <li key={person.id} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-300 w-5">{i + 1}</span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.emoji}
                  </span>
                  <span className="font-semibold text-gray-800">{person.name}</span>
                  <span className="ml-auto text-2xl font-bold" style={{ color: person.color }}>
                    {person.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pl-11">
                  {person.visitedCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setSelected({ code: c.code, geoName: c.name })}
                      className="text-xs text-gray-500 hover:text-indigo-600 hover:underline"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          {/* Legend */}
          <div className="mt-auto px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 font-medium mb-2">Legend</p>
            <div className="flex flex-col gap-2">
              {persons.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  {/* Dot indicator preview */}
                  <svg width="10" height="10" viewBox="-5 -5 10 10">
                   <circle cx="0" cy="0" r="3" fill={p.color} stroke="white" strokeWidth="0.8" />
                  </svg>
                  <span className="text-xs text-gray-600">{p.emoji} {p.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0 bg-gray-200 border border-gray-300" />
                <span className="text-xs text-gray-400">Not visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0 bg-indigo-50 border border-indigo-200" />
                <span className="text-xs text-gray-400">Visited</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 italic">Pins = visitors per country</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
