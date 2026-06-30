"use client";

import React, { useState } from "react";

interface PhotoItem {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

interface PhotoUploaderProps {
  tripId: string;
  existingPhotos: PhotoItem[];
}

export default function PhotoUploader({ tripId, existingPhotos }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tripId", tripId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const photo = await res.json();
        setPhotos((prev) => [...prev, photo]);
      } else {
        setError("Failed to upload one or more photos.");
      }
    }

    setUploading(false);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-400 transition-colors bg-gray-50">
        <span className="text-3xl">{uploading ? "⏳" : "📤"}</span>
        <span className="text-sm font-medium text-gray-600">
          {uploading ? "Uploading…" : "Click or drag photos here"}
        </span>
        <span className="text-xs text-gray-400">JPEG, PNG, WebP — multiple allowed</span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption ?? ""} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
