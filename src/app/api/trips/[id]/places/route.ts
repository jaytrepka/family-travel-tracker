import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;
  const body = await req.json();

  const place = await prisma.place.create({
    data: {
      tripId,
      name: body.name,
      description: body.description ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      category: body.category ?? "SIGHTSEEING",
      date: body.date ? new Date(body.date) : null,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json(place, { status: 201 });
}
