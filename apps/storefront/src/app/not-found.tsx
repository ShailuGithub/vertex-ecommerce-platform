import { AlertTriangle } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function RootNotFound() {
  return (
    <div className="container mx-auto px-4 py-20">
      <EmptyState
        title="404 — Page Not Found"
        description="The page or store you're looking for doesn't exist."
        icon={AlertTriangle}
      />
    </div>
  );
}
