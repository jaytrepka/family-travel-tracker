import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; placeId: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { placeId } = await params;
  await prisma.place.delete({ where: { id: placeId } });
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; placeId: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { placeId } = await params;
  const body = await req.json();

  const place = await prisma.place.update({
    where: { id: placeId },
    data: {
      name: body.name,
      description: body.description ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      category: body.category,
      date: body.date ? new Date(body.date) : null,
      order: body.order,
    },
  });

  return NextResponse.json(place);
}
