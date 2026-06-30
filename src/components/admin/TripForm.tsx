"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Person {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

interface Country {
  code: string;
  name: string;
  continent: string;
}

interface TripFormData {
  id?: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  description: string;
  funFacts: string;
  blogUrl: string;
  coverPhotoUrl: string;
  published: boolean;
  participantIds: string[];
  countryCodes: string[];
}

interface TripFormProps {
  persons: Person[];
  /** Pass existing countries for edit mode; for new trips the form fetches all countries */
  countries?: Country[];
  initialData?: TripFormData;
}

export default function TripForm({ persons, countries: countriesProp, initialData }: TripFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = Boolean(initialData?.id);

  // Pre-select country from URL param (e.g. ?country=ALB when coming from map)
  const preselectedCode = searchParams.get("country") ?? "";

  const [countries, setCountries] = useState<Country[]>(countriesProp ?? []);
  const [countrySearch, setCountrySearch] = useState("");

  // Load all countries from API (always, so admins see everything)
  useEffect(() => {
    fetch("/api/countries/all")
      .then((r) => r.json())
      .then((data: Country[]) => setCountries(data));
  }, []);

  const [form, setForm] = useState<TripFormData>(
    initialData ?? {
      title: "",
      slug: "",
      startDate: "",
      endDate: "",
      description: "",
      funFacts: "",
      blogUrl: "",
      coverPhotoUrl: "",
      published: false,
      participantIds: [],
      countryCodes: preselectedCode ? [preselectedCode] : [],
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof TripFormData>(key: K, value: TripFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function toggleId(arr: string[], id: string): string[] {
    return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEditing ? `/api/trips/${initialData!.id}` : "/api/trips";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    await fetch(`/api/trips/${initialData!.id}`, { method: "DELETE" });
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Title & slug */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!isEditing) set("slug", autoSlug(e.target.value));
            }}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
        <div className="flex gap-2 flex-wrap">
          {persons.map((p) => {
            const active = form.participantIds.includes(p.id);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => set("participantIds", toggleId(form.participantIds, p.id))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600"
                }`}
                style={active ? { backgroundColor: p.color, borderColor: p.color } : {}}
              >
                {p.emoji} {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Countries
          {form.countryCodes.length > 0 && (
            <span className="ml-2 text-xs text-indigo-600 font-normal">
              {form.countryCodes.length} selected
            </span>
          )}
        </label>
        {/* Search box */}
        <input
          type="text"
          placeholder="🔍 Filter countries…"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          className="w-full px-3 py-1.5 mb-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="border border-gray-200 rounded-xl max-h-52 overflow-y-auto p-3 space-y-3">
          {countries.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Loading countries…</p>
          )}
          {Object.entries(
            countries
              .filter((c) =>
                countrySearch.trim() === "" ||
                c.name.toLowerCase().includes(countrySearch.toLowerCase())
              )
              .reduce<Record<string, Country[]>>((acc, c) => {
                (acc[c.continent] ??= []).push(c);
                return acc;
              }, {})
          ).map(([continent, cs]) => (
            <div key={continent}>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                {continent.replace("_", " ")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cs.map((c) => {
                  const active = form.countryCodes.includes(c.code);
                  return (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => set("countryCodes", toggleId(form.countryCodes, c.code))}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog URL + Cover photo URL */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blog URL</label>
          <input
            type="url"
            value={form.blogUrl}
            onChange={(e) => set("blogUrl", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo URL</label>
          <input
            type="url"
            value={form.coverPhotoUrl}
            onChange={(e) => set("coverPhotoUrl", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      {/* Fun facts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">⭐ Zajímavosti</label>
        <textarea
          value={form.funFacts}
          onChange={(e) => set("funFacts", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set("published", !form.published)}
          className={`relative w-10 h-6 rounded-full transition-colors ${form.published ? "bg-green-500" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.published ? "left-5" : "left-1"}`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {form.published ? "Published (visible on site)" : "Draft (hidden)"}
        </span>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Trip"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
