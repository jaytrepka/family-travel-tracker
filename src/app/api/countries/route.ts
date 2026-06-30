import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Continent } from "@prisma/client";

/**
 * GET /api/countries
 * Returns all countries that appear in at least one published trip,
 * enriched with the list of distinct visitors (person ids + colors).
 */
export async function GET() {
  // Fetch all published trip→country→participant data in one query
  const trips = await prisma.trip.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      startDate: true,
      endDate: true,
      coverPhotoUrl: true,
      participants: {
        include: {
          person: {
            select: { id: true, name: true, color: true, emoji: true, order: true },
          },
        },
      },
      countries: {
        include: {
          country: {
            select: { code: true, name: true, continent: true },
          },
        },
      },
    },
  });

  // Build a map: countryCode -> { country info, set of visitors, trips[] }
  const countryMap = new Map<
    string,
    {
      code: string;
      name: string;
      continent: Continent;
      visitors: Map<string, { color: string; order: number }>;
      trips: typeof trips;
    }
  >();

  for (const trip of trips) {
    const personsSorted = trip.participants
      .map((p) => p.person)
      .sort((a, b) => a.order - b.order);

    for (const tc of trip.countries) {
      const { code, name, continent } = tc.country;
      if (!countryMap.has(code)) {
        countryMap.set(code, {
          code,
          name,
          continent,
          visitors: new Map(),
          trips: [],
        });
      }
      const entry = countryMap.get(code)!;
      entry.trips.push(trip);
      for (const p of personsSorted) {
        if (!entry.visitors.has(p.id)) {
          entry.visitors.set(p.id, { color: p.color, order: p.order });
        }
      }
    }
  }

  // Convert to array, sort visitors by order
  const result = Array.from(countryMap.values()).map(({ visitors, trips: countryTrips, ...rest }) => {
    const sortedVisitors = Array.from(visitors.entries()).sort((a, b) => a[1].order - b[1].order);
    return {
      ...rest,
      visitorIds: sortedVisitors.map(([id]) => id),
      visitorColors: sortedVisitors.map(([, v]) => v.color),
      trips: countryTrips.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        startDate: t.startDate.toISOString(),
        endDate: t.endDate.toISOString(),
        coverPhotoUrl: t.coverPhotoUrl,
        participants: t.participants.map((p) => ({
          personId: p.person.id,
          person: { name: p.person.name, color: p.person.color, emoji: p.person.emoji },
        })),
        countries: t.countries.map((c) => ({ countryCode: c.country.code })),
      })),
    };
  });

  return NextResponse.json(result);
}
