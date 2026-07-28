import { FairStatus } from "@/lib/types";
import { CheckCircle2, Ban, XCircle } from "lucide-react";

const CONFIG: Record<FairStatus, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  Published: { label: "Published", color: "text-published", bg: "bg-published-bg", border: "border-published/40", Icon: CheckCircle2 },
  SoldOut: { label: "Sold Out", color: "text-soldout", bg: "bg-soldout-bg", border: "border-soldout/40", Icon: Ban },
  Cancelled: { label: "Cancelled", color: "text-cancelled", bg: "bg-cancelled-bg", border: "border-cancelled/40", Icon: XCircle },
};

/**
 * A rubber-stamp style badge, tilted slightly, styled to read like a ledger
 * clerk's ink stamp — the calendar's one recurring signature element.
 */
export default function StatusStamp({ status, size = "sm" }: { status: FairStatus; size?: "sm" | "md" }) {
  const c = CONFIG[status];
  const pad = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[3px] border ${c.border} ${c.bg} ${c.color} ${pad} font-mono uppercase tracking-[0.14em] font-semibold -rotate-2 select-none`}
    >
      <c.Icon size={size === "md" ? 13 : 11} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}
