"use client";

import React from "react";
import Link from "next/link";
import { TripSummary } from "@/types";

interface TripCardProps {
  trip: TripSummary;
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return { range: `${fmt(s)} – ${fmt(e)}`, days };
}

export default function TripCard({ trip }: TripCardProps) {
  const { range, days } = formatDateRange(trip.startDate, trip.endDate);
  const countries = trip.countries.map((c) => c.countryCode);

  return (
    <Link href={`/timeline/${trip.slug}`} className="group block">
      <article className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
        {/* Cover photo or placeholder */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          {trip.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.coverPhotoUrl}
              alt={trip.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">✈️</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {trip.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{range}</p>
          <p className="text-xs text-gray-400 mt-0.5">{days} days</p>

          {/* Participants */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {trip.participants.map(({ personId, person }) => (
              <span
                key={personId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: person.color }}
              >
                {person.emoji} {person.name}
              </span>
            ))}
          </div>

          {/* Countries */}
          {countries.length > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              🗺️ {countries.join(", ")}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
