import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import TripForm from "@/components/admin/TripForm";

export default async function NewTripPage() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin");

  const [persons, countries] = await Promise.all([
    prisma.person.findMany({ orderBy: { order: "asc" } }),
    prisma.country.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">✈️ New Trip</h1>
      <TripForm persons={persons} countries={countries} />
    </main>
  );
}
