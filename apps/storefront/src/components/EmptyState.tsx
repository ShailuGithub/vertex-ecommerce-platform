import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Button from "@/components/ui/Button";

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  cta,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="mb-1 text-lg font-semibold text-foreground">{title}</p>
      {description && <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {cta && (
        <Button asChild>
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
