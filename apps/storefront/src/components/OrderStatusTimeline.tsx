import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { status: "PENDING_PAYMENT", label: "Order placed" },
  { status: "PAID", label: "Payment confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

interface StatusHistoryEntry {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
  changedByUser: { firstName: string; lastName: string } | null;
}

export default function OrderStatusTimeline({
  status,
  createdAt,
  statusHistory,
}: {
  status: string;
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
}) {
  const historyByStatus = new Map(statusHistory.map((entry) => [entry.status, entry]));
  const isTerminalException = status === "CANCELLED" || status === "REFUNDED";
  const currentStepIndex = isTerminalException ? -1 : STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="space-y-0">
      {STEPS.map((step, i) => {
        const entry = historyByStatus.get(step.status);
        const timestamp = step.status === "PENDING_PAYMENT" ? createdAt : entry?.createdAt;
        // A step reads as "reached" either because the live status has advanced past it,
        // or (once the order has been cancelled/refunded) because a history row proves it happened.
        const isComplete = isTerminalException
          ? step.status === "PENDING_PAYMENT" || historyByStatus.has(step.status)
          : i <= currentStepIndex;
        const isCurrent = !isTerminalException && i === currentStepIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && <span className={cn("absolute left-[15px] top-8 h-full w-0.5", isComplete ? "bg-primary" : "bg-border")} />}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                isComplete ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </span>
            <div className="pt-1">
              <p className={cn("text-sm font-medium", isComplete ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
                {isCurrent && <span className="ml-2 text-xs font-normal text-primary">(current)</span>}
              </p>
              {timestamp && <p className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleString()}</p>}
              {entry?.note && <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>}
            </div>
          </li>
        );
      })}

      {isTerminalException && (
        <li className="relative flex gap-4">
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-white">
            <X className="h-4 w-4" />
          </span>
          <div className="pt-1">
            <p className="text-sm font-medium text-destructive">{status === "CANCELLED" ? "Cancelled" : "Refunded"}</p>
            {historyByStatus.get(status) && (
              <p className="text-xs text-muted-foreground">{new Date(historyByStatus.get(status)!.createdAt).toLocaleString()}</p>
            )}
            {historyByStatus.get(status)?.note && <p className="mt-1 text-xs text-muted-foreground">{historyByStatus.get(status)!.note}</p>}
          </div>
        </li>
      )}
    </ol>
  );
}
