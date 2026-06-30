"use client";

import React, { useState } from "react";
import { PlaceCategory } from "@prisma/client";

const CATEGORIES: PlaceCategory[] = [
  "ACCOMMODATION", "SIGHTSEEING", "KID_FRIENDLY", "RESTAURANT", "TRANSPORT", "NATURE", "OTHER",
];

const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  ACCOMMODATION: "🏨",
  SIGHTSEEING: "🗺️",
  KID_FRIENDLY: "🎡",
  RESTAURANT: "🍽️",
  TRANSPORT: "🚌",
  NATURE: "🌿",
  OTHER: "📍",
};

interface PlaceItem {
  id: string;
  name: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  category: PlaceCategory;
  date: string | null;
  order: number;
}

interface PlacesManagerProps {
  tripId: string;
  initialPlaces: PlaceItem[];
}

const emptyPlace = (): Omit<PlaceItem, "id" | "order"> => ({
  name: "",
  description: "",
  lat: null,
  lng: null,
  category: "SIGHTSEEING",
  date: null,
});

export default function PlacesManager({ tripId, initialPlaces }: PlacesManagerProps) {
  const [places, setPlaces] = useState<PlaceItem[]>(initialPlaces);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyPlace());
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/trips/${tripId}/places`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: places.length }),
    });

    if (res.ok) {
      const place = await res.json();
      setPlaces((prev) => [...prev, place]);
      setForm(emptyPlace());
      setAdding(false);
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/trips/${tripId}/places/${id}`, { method: "DELETE" });
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-3">
      {places.map((place) => (
        <div key={place.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          <span className="text-xl">{CATEGORY_ICONS[place.category]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-800 truncate">{place.name}</p>
            {place.description && (
              <p className="text-xs text-gray-500 truncate">{place.description}</p>
            )}
          </div>
          <button
            onClick={() => handleDelete(place.id)}
            className="text-red-400 hover:text-red-600 text-sm transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PlaceCategory })}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lat</label>
              <input
                type="number"
                step="any"
                value={form.lat ?? ""}
                onChange={(e) => setForm({ ...form, lat: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lng</label>
              <input
                type="number"
                step="any"
                value={form.lng ?? ""}
                onChange={(e) => setForm({ ...form, lng: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={form.date ?? ""}
                onChange={(e) => setForm({ ...form, date: e.target.value || null })}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add Place"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          + Add Place
        </button>
      )}
    </div>
  );
}
