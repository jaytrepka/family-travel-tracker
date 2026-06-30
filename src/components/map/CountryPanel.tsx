"use client";

import React from "react";
import Link from "next/link";
import { CountryWithVisitors } from "@/types";
import { useAdminStatus } from "@/hooks/useAdminStatus";

interface PersonInfo {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

interface CountryPanelProps {
  /** Full country data if it exists in DB (has been visited), or null for unvisited */
  country: CountryWithVisitors | null;
  /** Raw name from the topojson, always available */
  geoName: string;
  persons: PersonInfo[];
  onClose: () => void;
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return {
    label: `${s.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} – ${e.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
    days,
  };
}

export default function CountryPanel({ country, geoName, persons, onClose }: CountryPanelProps) {
  const { isAdmin } = useAdminStatus();
  const personMap = new Map(persons.map((p) => [p.id, p]));

  const displayName = country?.name ?? geoName;
  const trips = country?.trips ?? [];
  const visitorIds = country?.visitorIds ?? [];

  // Build add-trip URL — pre-select this country if it exists in DB
  const addTripUrl = country
    ? `/admin/trips/new?country=${country.code}`
    : `/admin/trips/new?countryName=${encodeURIComponent(geoName)}`;

  return (
    <div className="absolute top-4 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-bold text-lg leading-tight">{displayName}</h3>
          {country && (
            <p className="text-xs text-indigo-200 mt-0.5">{country.continent.replace("_", " ")}</p>
          )}
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none ml-3 flex-shrink-0">×</button>
      </div>

      {/* Visitors row */}
      {visitorIds.length > 0 && (
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Visited by</p>
          <div className="flex gap-1.5 flex-wrap">
            {visitorIds.map((id) => {
              const p = personMap.get(id);
              if (!p) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium"
                  style={{ backgroundColor: p.color }}
                >
                  {p.emoji} {p.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Trips list */}
      <div className="flex-1 overflow-y-auto">
        {trips.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <div className="text-3xl mb-2">🏝️</div>
            <p className="text-sm font-medium">Not visited yet</p>
            <p className="text-xs mt-1">Be the first to explore {displayName}!</p>
          </div>
        ) : (
          <div className="px-3 py-2 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider px-1 mt-1">
              {trips.length} Trip{trips.length !== 1 ? "s" : ""}
            </p>
            {trips.map((trip) => {
              const { label, days } = formatDateRange(trip.startDate, trip.endDate);
              return (
                <div
                  key={trip.id}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                >
                  {/* Trip cover */}
                  <div className="flex gap-2 p-2.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {trip.coverPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={trip.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">✈️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{trip.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      <p className="text-xs text-gray-400">{days} days</p>
                    </div>
                  </div>
                  {/* Participants */}
                  <div className="flex items-center gap-1 px-2.5 pb-2">
                    <div className="flex gap-1 flex-wrap flex-1">
                      {trip.participants.map(({ personId, person }) => (
                        <span
                          key={personId}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-xs"
                          style={{ backgroundColor: person.color }}
                        >
                          {person.emoji} {person.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Link
                        href={`/timeline/${trip.slug}`}
                        className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors"
                      >
                        View
                      </Link>
                      {isAdmin && (
                        <Link
                          href={`/admin/trips/${trip.id}`}
                          className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium transition-colors"
                        >
                          ✏️
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
        {isAdmin ? (
          <Link
            href={addTripUrl}
            className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <span>+</span>
            <span>Add Trip to {displayName}</span>
          </Link>
        ) : (
          <p className="text-xs text-center text-gray-400">
            <Link href="/admin" className="text-indigo-500 hover:underline">Log in as admin</Link>
            {" "}to add or edit trips
          </p>
        )}
      </div>
    </div>
  );
}
