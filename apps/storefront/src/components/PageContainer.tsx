import { cn } from "@/lib/utils";

export default function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12", className)}>{children}</div>;
}
