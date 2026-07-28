"use client";

import { CareerFair, effectiveStatus } from "@/lib/types";
import { buildMonthGrid, isoDate, MONTH_NAMES, WEEKDAY_LABELS } from "@/lib/dateUtils";

const DOT_COLOR: Record<string, string> = {
  Published: "bg-published",
  SoldOut: "bg-soldout",
  Cancelled: "bg-cancelled",
};

export default function MonthCard({
  year,
  month,
  eventsByDate,
  onSelectDay,
}: {
  year: number;
  month: number;
  eventsByDate: Record<string, CareerFair[]>;
  onSelectDay: (fairs: CareerFair[]) => void;
}) {
  const weeks = buildMonthGrid(year, month);
  const monthHasEvents = Object.keys(eventsByDate).some((iso) => iso.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));

  return (
    <div className="relative rounded-md border border-line bg-card shadow-ledger overflow-hidden">
      {/* Ledger index tab */}
      <div className="absolute -left-0 top-4 flex items-center">
        <span className="rounded-r-sm bg-ink px-1.5 py-0.5 font-mono text-[10px] text-gold tracking-widest">
          {String(month + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="pl-7 pr-4 pt-4 pb-3 border-b border-line">
        <h3 className="font-display text-base text-ink">{MONTH_NAMES[month]}</h3>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAY_LABELS.map((w, i) => (
            <span key={i} className="font-mono text-[9px] text-slate/70">
              {w}
            </span>
          ))}
          {weeks.flat().map((day, idx) => {
            if (day === null) return <span key={idx} />;
            const iso = isoDate(year, month, day);
            const fairs = eventsByDate[iso];
            const hasEvent = !!fairs?.length;
            return (
              <button
                key={idx}
                disabled={!hasEvent}
                onClick={() => hasEvent && onSelectDay(fairs)}
                className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-mono transition-colors ${
                  hasEvent
                    ? "cursor-pointer font-semibold text-ink hover:bg-paper"
                    : "text-slate/60 cursor-default"
                }`}
              >
                {day}
                {hasEvent && (
                  <span className="absolute bottom-0.5 flex gap-[2px]">
                    {fairs.slice(0, 3).map((f) => (
                      <span key={f.id} className={`h-[4px] w-[4px] rounded-full ${DOT_COLOR[effectiveStatus(f)]}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!monthHasEvents && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-slate/60">No fairs scheduled</p>
        )}
      </div>
    </div>
  );
}
