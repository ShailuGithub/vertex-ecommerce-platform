"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface ProductImage {
  id: number;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

export default function VariantImages({ variantId, images }: { variantId: number; images: ProductImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData?.message ?? "Upload failed");

      await apiFetch(`/products/variants/${variantId}/images`, {
        method: "POST",
        body: JSON.stringify({ url: uploadData.url, isPrimary: images.length === 0 }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function setPrimary(imageId: number) {
    await apiFetch(`/products/variants/${variantId}/images/${imageId}/primary`, { method: "PATCH" });
    router.refresh();
  }

  async function removeImage(imageId: number) {
    await apiFetch(`/products/variants/${variantId}/images/${imageId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="w-20 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API_URL}${image.url}`}
              alt={image.altText ?? ""}
              className={`h-20 w-20 rounded-lg object-cover ${
                image.isPrimary ? "ring-2 ring-brand-500" : "ring-1 ring-slate-200"
              }`}
            />
            <div className="mt-1 text-xs">
              {image.isPrimary ? (
                <span className="font-medium text-brand-600">Primary</span>
              ) : (
                <button onClick={() => setPrimary(image.id)} className="text-slate-500 hover:text-brand-600">
                  Set primary
                </button>
              )}
            </div>
            <button onClick={() => removeImage(image.id)} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-50"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
