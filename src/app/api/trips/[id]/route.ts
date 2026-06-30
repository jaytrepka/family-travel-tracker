import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/trips/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const trip = await prisma.trip.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      participants: { include: { person: true } },
      countries: { include: { country: true } },
      places: { orderBy: { order: "asc" }, include: { photos: { orderBy: { order: "asc" } } } },
      photos: { where: { placeId: null }, orderBy: { order: "asc" } },
    },
  });

  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

// PUT /api/trips/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    title, slug, startDate, endDate, description, funFacts,
    blogUrl, coverPhotoUrl, published,
    participantIds, countryCodes,
  } = body;

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      title,
      slug,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      description,
      funFacts,
      blogUrl,
      coverPhotoUrl,
      published,
      // Replace participants
      ...(participantIds !== undefined
        ? {
            participants: {
              deleteMany: {},
              create: participantIds.map((pid: string) => ({ personId: pid })),
            },
          }
        : {}),
      // Replace countries
      ...(countryCodes !== undefined
        ? {
            countries: {
              deleteMany: {},
              create: countryCodes.map((code: string) => ({ countryCode: code })),
            },
          }
        : {}),
    },
    include: {
      participants: { include: { person: true } },
      countries: { include: { country: true } },
    },
  });

  return NextResponse.json(trip);
}

// DELETE /api/trips/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.trip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
