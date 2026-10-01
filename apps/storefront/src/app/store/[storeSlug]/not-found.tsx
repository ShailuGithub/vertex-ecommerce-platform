"use client";

import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function StoreNotFound() {
  const { storeSlug } = useParams<{ storeSlug: string }>();

  return (
    <div className="container mx-auto px-4 py-20">
      <EmptyState
        title="404 — Page Not Found"
        description="We're sorry, the page you're looking for doesn't exist. Try heading back to the home page."
        icon={AlertTriangle}
        cta={{ href: `/store/${storeSlug}`, label: "Go back to home" }}
      />
    </div>
  );
}
