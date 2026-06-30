import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const persons = await prisma.person.findMany({
    orderBy: { order: "asc" },
    include: { trips: { select: { tripId: true } } },
  });
  return NextResponse.json(persons);
}
