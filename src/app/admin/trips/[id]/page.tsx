import React from "react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import TripForm from "@/components/admin/TripForm";
import PlacesManager from "@/components/admin/PlacesManager";
import PhotoUploader from "@/components/admin/PhotoUploader";

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin");

  const { id } = await params;

  const [trip, persons, countries] = await Promise.all([
    prisma.trip.findUnique({
      where: { id },
      include: {
        participants: true,
        countries: true,
        places: { orderBy: { order: "asc" }, include: { photos: true } },
        photos: { where: { placeId: null }, orderBy: { order: "asc" } },
      },
    }),
    prisma.person.findMany({ orderBy: { order: "asc" } }),
    prisma.country.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!trip) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">✏️ Edit: {trip.title}</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Trip Details</h2>
        <TripForm
          persons={persons}
          countries={countries}
          initialData={{
            id: trip.id,
            title: trip.title,
            slug: trip.slug,
            startDate: trip.startDate.toISOString().slice(0, 10),
            endDate: trip.endDate.toISOString().slice(0, 10),
            description: trip.description ?? "",
            funFacts: trip.funFacts ?? "",
            blogUrl: trip.blogUrl ?? "",
            coverPhotoUrl: trip.coverPhotoUrl ?? "",
            published: trip.published,
            participantIds: trip.participants.map((p) => p.personId),
            countryCodes: trip.countries.map((c) => c.countryCode),
          }}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Places</h2>
        <PlacesManager tripId={trip.id} initialPlaces={trip.places as never} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Photos</h2>
        <PhotoUploader tripId={trip.id} existingPhotos={trip.photos as never} />
      </section>
    </main>
  );
}
