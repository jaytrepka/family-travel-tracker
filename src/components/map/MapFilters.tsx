"use client";

import React from "react";
import type { Continent, MapFilters, PersonWithTrips } from "@/types";

const CONTINENTS: { value: Continent; label: string }[] = [
  { value: "EUROPE", label: "Europe" },
  { value: "ASIA", label: "Asia" },
  { value: "AFRICA", label: "Africa" },
  { value: "NORTH_AMERICA", label: "N. America" },
  { value: "SOUTH_AMERICA", label: "S. America" },
  { value: "OCEANIA", label: "Oceania" },
  { value: "ANTARCTICA", label: "Antarctica" },
];

interface MapFiltersProps {
  persons: PersonWithTrips[];
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
}

export default function MapFilters({ persons, filters, onChange }: MapFiltersProps) {
  function toggleContinent(continent: Continent) {
    const next = filters.continents.includes(continent)
      ? filters.continents.filter((c) => c !== continent)
      : [...filters.continents, continent];
    onChange({ ...filters, continents: next });
  }

  function togglePerson(id: string) {
    const allIds = persons.map((p) => p.id);
    // If this person is already the sole selection → reset to all
    if (filters.personIds.length === 1 && filters.personIds[0] === id) {
      onChange({ ...filters, personIds: allIds });
    } else {
      // Select only this person
      onChange({ ...filters, personIds: [id] });
    }
  }

  return (
    <div className="flex flex-wrap gap-4 items-center px-4 py-2 bg-white border-b border-gray-100 text-sm">
      {/* Continent toggles */}
      <div className="flex flex-wrap gap-1">
        {CONTINENTS.map(({ value, label }) => {
          const active = filters.continents.length === 0 || filters.continents.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleContinent(value)}
              className={`px-2.5 py-1 rounded-full border transition-all text-xs font-medium ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-500 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-200 hidden sm:block" />

      {/* Person toggles */}
      <div className="flex gap-2">
        {persons.map((person) => {
          const allSelected = filters.personIds.length === persons.length;
          const active = allSelected || filters.personIds.includes(person.id);
          const solo = filters.personIds.length === 1 && filters.personIds[0] === person.id;
          return (
            <button
              key={person.id}
              onClick={() => togglePerson(person.id)}
              title={solo ? `Click to show all` : `Show only ${person.name}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs font-medium ${
                active
                  ? "text-white border-transparent"
                  : "bg-white border-gray-300 text-gray-400 opacity-40"
              }`}
              style={active ? { backgroundColor: person.color, borderColor: person.color } : {}}
            >
              <span>{person.emoji}</span>
              <span>{person.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
