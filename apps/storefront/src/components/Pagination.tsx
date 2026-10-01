import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Pagination({
  baseHref,
  page,
  totalPages,
}: {
  baseHref: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const separator = baseHref.includes("?") ? "&" : "?";
  const hrefFor = (p: number) => `${baseHref}${separator}page=${p}`;

  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <Button variant="outline" size="icon" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      {pages.map((p) => (
        <Button key={p} variant={p === page ? "default" : "outline"} size="icon" asChild={p !== page}>
          {p === page ? <span>{p}</span> : <Link href={hrefFor(p)}>{p}</Link>}
        </Button>
      ))}
      <Button variant="outline" size="icon" disabled={page >= totalPages} asChild={page < totalPages}>
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
