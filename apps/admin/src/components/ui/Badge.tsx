type Tone = "slate" | "green" | "amber" | "red" | "blue" | "indigo";

const tones: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-700",
  indigo: "bg-brand-100 text-brand-700",
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
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
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
