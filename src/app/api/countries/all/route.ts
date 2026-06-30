import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/countries/all — returns every country in the DB, for the admin trip form */
export async function GET() {
  const countries = await prisma.country.findMany({
    orderBy: [{ continent: "asc" }, { name: "asc" }],
    select: { code: true, name: true, continent: true },
  });
  return NextResponse.json(countries);
}
