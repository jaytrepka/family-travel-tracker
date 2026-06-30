import React, { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import TripCard from "@/components/timeline/TripCard";
import { TripSummary } from "@/types";

async function getTrips(searchParams: { [key: string]: string | undefined }): Promise<TripSummary[]> {
  const { person, continent, q } = searchParams;

  const trips = await prisma.trip.findMany({
    where: {
      published: true,
      ...(person ? { participants: { some: { personId: person } } } : {}),
      ...(continent ? { countries: { some: { country: { continent: continent as never } } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { countries: { some: { country: { name: { contains: q, mode: "insensitive" } } } } },
            ],
          }
        : {}),
    },
    orderBy: { startDate: "desc" },
    include: {
      participants: { include: { person: { select: { name: true, color: true, emoji: true } } } },
      countries: { select: { countryCode: true } },
    },
  });

  return trips.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    coverPhotoUrl: t.coverPhotoUrl,
    participants: t.participants.map((p) => ({
      personId: p.personId,
      person: p.person,
    })),
    countries: t.countries,
  }));
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const trips = await getTrips(sp);

  // Group by year
  const byYear = new Map<number, TripSummary[]>();
  for (const trip of trips) {
    const year = new Date(trip.startDate).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(trip);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">📅 Timeline</h1>
      <p className="text-gray-500 mb-8">All family adventures, chronologically.</p>

      {trips.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🏝️</div>
          <p>No trips found. Time to travel!</p>
        </div>
      ) : (
        years.map((year) => (
          <section key={year} className="mb-10">
            <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                {year.toString().slice(2)}
              </span>
              {year}
            </h2>
            <div className="space-y-3">
              {byYear.get(year)!.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
