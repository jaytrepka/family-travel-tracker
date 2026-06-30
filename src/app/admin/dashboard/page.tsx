import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Trip, TripParticipant, Person, TripCountry } from "@prisma/client";

type TripWithRelations = Trip & {
  participants: (TripParticipant & { person: Pick<Person, "name" | "color" | "emoji"> })[];
  countries: Pick<TripCountry, "countryCode">[];
};

async function getStats() {
  const [tripCount, publishedCount, countryCount, personCount] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.count({ where: { published: true } }),
    prisma.country.count(),
    prisma.person.count(),
  ]);
  return { tripCount, publishedCount, countryCount, personCount };
}

async function getAllTrips(): Promise<TripWithRelations[]> {
  return prisma.trip.findMany({
    orderBy: { startDate: "desc" },
    include: {
      participants: { include: { person: { select: { name: true, color: true, emoji: true } } } },
      countries: { select: { countryCode: true } },
    },
  });
}

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin");

  const [stats, trips] = await Promise.all([getStats(), getAllTrips()]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage trips, places and photos.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/trips/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + New Trip
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total trips", value: stats.tripCount, icon: "✈️" },
          { label: "Published", value: stats.publishedCount, icon: "✅" },
          { label: "Countries in DB", value: stats.countryCount, icon: "🗺️" },
          { label: "Family members", value: stats.personCount, icon: "👨‍👩‍👧‍👦" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Trips table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">All Trips</h2>
        </div>
        {trips.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No trips yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Title</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Dates</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Countries</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Participants</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips.map((trip: TripWithRelations) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{trip.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {trip.startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {trip.countries.map((c) => c.countryCode).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {trip.participants.map(({ person }, i) => (
                          <span key={i} title={person.name} className="text-base">
                            {person.emoji}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          trip.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {trip.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trips/${trip.id}`}
                        className="text-indigo-600 hover:underline text-xs font-medium"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
