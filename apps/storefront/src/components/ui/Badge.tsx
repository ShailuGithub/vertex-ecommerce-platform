import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type Tone = "slate" | "green" | "amber" | "red" | "blue" | "indigo";

const TONES: Record<Tone, { variant: VariantProps<typeof badgeVariants>["variant"]; className?: string }> = {
  slate: { variant: "secondary" },
  green: { variant: "default", className: "border-transparent bg-green-600 text-white hover:bg-green-600/90" },
  amber: { variant: "outline", className: "border-amber-300 bg-amber-50 text-amber-700" },
  red: { variant: "destructive" },
  blue: { variant: "default", className: "border-transparent bg-blue-600 text-white hover:bg-blue-600/90" },
  indigo: { variant: "default" },
};

export default function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const { variant, className: toneClassName } = TONES[tone];
  return <span className={cn(badgeVariants({ variant }), toneClassName, className)}>{children}</span>;
}

const ORDER_STATUS_TONE: Record<string, Tone> = {
  PENDING_PAYMENT: "amber",
  PAID: "blue",
  PROCESSING: "indigo",
  SHIPPED: "indigo",
  DELIVERED: "green",
  CANCELLED: "red",
  REFUNDED: "red",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={ORDER_STATUS_TONE[status] ?? "slate"}>{status.replace(/_/g, " ")}</Badge>;
}
