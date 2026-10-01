import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PageHeaderBanner({
  title,
  storeSlug,
  storeName,
  current,
}: {
  title: string;
  storeSlug: string;
  storeName: string;
  current: string;
}) {
  return (
    <div className="border-b border-border bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Link href={`/store/${storeSlug}`} className="hover:text-foreground transition-colors">
            {storeName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{current}</span>
        </div>
      </div>
    </div>
  );
}
