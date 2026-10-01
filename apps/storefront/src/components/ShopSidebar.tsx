import Link from "next/link";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryLink {
  id: number;
  name: string;
  slug: string;
}

export default function ShopSidebar({
  storeSlug,
  categories,
  activeCategorySlug,
}: {
  storeSlug: string;
  categories: CategoryLink[];
  activeCategorySlug?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Product Categories</h4>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="space-y-1">
          {categories.map((c) => {
            const active = c.slug === activeCategorySlug;
            return (
              <li key={c.id}>
                <Link
                  href={`/store/${storeSlug}/categories/${c.slug}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Tag className="h-4 w-4" />
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
