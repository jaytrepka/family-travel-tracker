import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const tripId = formData.get("tripId") as string;
  const placeId = formData.get("placeId") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !tripId) {
    return NextResponse.json({ error: "file and tripId are required" }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: "public" });

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      caption,
      tripId,
      placeId: placeId || null,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
