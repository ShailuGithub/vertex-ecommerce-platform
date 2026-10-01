"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  altText: string | null;
}

const ASSET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ProductImageGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted">
        <span className="text-muted-foreground">No image</span>
      </div>
    );
  }

  const active = images[selected];

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSET_URL}${active.url}`}
          alt={active.altText ?? productName}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === selected ? "border-primary" : "border-transparent",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ASSET_URL}${img.url}`} alt={img.altText ?? productName} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
