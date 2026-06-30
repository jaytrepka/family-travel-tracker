import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/trips — list all published trips (with optional filters)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get("personId");
  const continent = searchParams.get("continent");

  const trips = await prisma.trip.findMany({
    where: {
      published: true,
      ...(personId
        ? { participants: { some: { personId } } }
        : {}),
      ...(continent
        ? { countries: { some: { country: { continent: continent as never } } } }
        : {}),
    },
    orderBy: { startDate: "desc" },
    include: {
      participants: { include: { person: { select: { name: true, color: true, emoji: true } } } },
      countries: { select: { countryCode: true } },
    },
  });

  return NextResponse.json(trips);
}

// POST /api/trips — create trip (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title, slug, startDate, endDate, description, funFacts,
    blogUrl, coverPhotoUrl, published,
    participantIds, countryCodes,
  } = body;

  const trip = await prisma.trip.create({
    data: {
      title,
      slug,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      funFacts,
      blogUrl,
      coverPhotoUrl,
      published: published ?? false,
      participants: {
        create: participantIds?.map((id: string) => ({ personId: id })) ?? [],
      },
      countries: {
        create: countryCodes?.map((code: string) => ({ countryCode: code })) ?? [],
      },
    },
    include: {
      participants: { include: { person: true } },
      countries: true,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}
