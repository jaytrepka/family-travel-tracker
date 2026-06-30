import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlaceCategory } from "@prisma/client";

const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  ACCOMMODATION: "🏨",
  SIGHTSEEING: "🗺️",
  KID_FRIENDLY: "🎡",
  RESTAURANT: "🍽️",
  TRANSPORT: "🚌",
  NATURE: "🌿",
  OTHER: "📍",
};

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  ACCOMMODATION: "Accommodation",
  SIGHTSEEING: "Sightseeing",
  KID_FRIENDLY: "Kid-Friendly",
  RESTAURANT: "Restaurant",
  TRANSPORT: "Transport",
  NATURE: "Nature",
  OTHER: "Other",
};

async function getTrip(slug: string) {
  return prisma.trip.findUnique({
    where: { slug },
    include: {
      participants: {
        include: { person: { select: { id: true, name: true, color: true, emoji: true, order: true } } },
        orderBy: { person: { order: "asc" } },
      },
      countries: { include: { country: { select: { code: true, name: true } } } },
      places: {
        orderBy: { order: "asc" },
        include: { photos: { orderBy: { order: "asc" } } },
      },
      photos: { where: { placeId: null }, orderBy: { order: "asc" } },
    },
  });
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();

  const duration = Math.ceil(
    (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/timeline" className="text-sm text-indigo-600 hover:underline mb-4 inline-flex items-center gap-1">
        ← Back to Timeline
      </Link>

      {/* Hero */}
      {trip.coverPhotoUrl && (
        <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-6 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trip.coverPhotoUrl} alt={trip.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{trip.title}</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm text-gray-500">
          {fmt(trip.startDate)} – {fmt(trip.endDate)}
        </span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500">{duration} days</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500">
          {trip.countries.map((c) => c.country.name).join(", ")}
        </span>
      </div>

      {/* Participants */}
      <div className="flex gap-2 flex-wrap mb-6">
        {trip.participants.map(({ person }) => (
          <span
            key={person.id}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: person.color }}
          >
            {person.emoji} {person.name}
          </span>
        ))}
      </div>

      {/* Blog link */}
      {trip.blogUrl && (
        <a
          href={trip.blogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors mb-6"
        >
          📝 Read Blog Post ↗
        </a>
      )}

      {/* Description */}
      {trip.description && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">About this trip</h2>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
            {trip.description}
          </div>
        </section>
      )}

      {/* Fun facts */}
      {trip.funFacts && (
        <section className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-amber-800 mb-2">⭐ Zajímavosti</h2>
          <div className="text-amber-700 text-sm whitespace-pre-wrap">{trip.funFacts}</div>
        </section>
      )}

      {/* Places */}
      {trip.places.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Places visited</h2>
          <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
            {trip.places.map((place) => (
              <div key={place.id} className="relative">
                <div className="absolute -left-[25px] w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-xs">
                  {CATEGORY_ICONS[place.category]}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{place.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {CATEGORY_LABELS[place.category]}
                    </span>
                    {place.date && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(place.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                  {place.description && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{place.description}</p>
                  )}
                  {place.photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {place.photos.map((photo) => (
                        <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt={photo.caption ?? ""} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {trip.photos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📸 Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trip.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
