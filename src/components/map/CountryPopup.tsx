"use client";

import React from "react";
import Link from "next/link";
import { CountryWithVisitors } from "@/types";

interface CountryPopupProps {
  country: CountryWithVisitors;
  persons: { id: string; name: string; color: string; emoji: string }[];
  onClose: () => void;
}

export default function CountryPopup({ country, persons, onClose }: CountryPopupProps) {
  const personMap = new Map(persons.map((p) => [p.id, p]));

  return (
    <div className="absolute top-4 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
        <h3 className="font-bold text-lg">{country.name}</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Visitors */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Visited by</p>
        <div className="flex gap-2 flex-wrap">
          {country.visitorIds.map((id) => {
            const p = personMap.get(id);
            if (!p) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: p.color }}
              >
                {p.emoji} {p.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Trips */}
      <div className="px-4 py-3 max-h-64 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Trips</p>
        <ul className="space-y-2">
          {country.trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/timeline/${trip.slug}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 transition-colors group"
              >
                {trip.coverPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={trip.coverPhotoUrl}
                    alt={trip.title}
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    ✈️
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800 text-sm group-hover:text-indigo-600">
                    {trip.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(trip.startDate).getFullYear()}
                    {" · "}
                    {trip.participants.map((p) => p.person.emoji).join(" ")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
