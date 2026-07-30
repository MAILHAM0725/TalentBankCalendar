"use client";

import { CareerFair } from "@/lib/types";
import { formatShortDate, todayIso } from "@/lib/dateUtils";
import { MapPin } from "lucide-react";

const MAX_PER_SECTION = 4;

export default function CalendarHighlights({
  fairs,
  onSelect,
}: {
  fairs: CareerFair[];
  onSelect: (fair: CareerFair) => void;
}) {
  const today = todayIso();
  const live = fairs.filter((f) => f.status !== "Cancelled");

  const happeningToday = live.filter((f) => f.date === today);
  const upcoming = live
    .filter((f) => f.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_PER_SECTION);
  const recentlyPassed = live
    .filter((f) => f.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_PER_SECTION);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Section title="Happening today" fairs={happeningToday} empty="No fairs today." onSelect={onSelect} accent />
      <Section title="Coming up" fairs={upcoming} empty="Nothing scheduled yet." onSelect={onSelect} />
      <Section title="Recently passed" fairs={recentlyPassed} empty="No fairs yet this year." onSelect={onSelect} muted />
    </div>
  );
}

function Section({
  title,
  fairs,
  empty,
  onSelect,
  accent,
  muted,
}: {
  title: string;
  fairs: CareerFair[];
  empty: string;
  onSelect: (fair: CareerFair) => void;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`rounded-md border bg-card shadow-ledger p-4 ${accent ? "border-gold/50" : "border-line"}`}>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-deep">{title}</h3>

      {fairs.length === 0 ? (
        <p className="mt-3 text-sm text-slate/70">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {fairs.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => onSelect(f)}
                className={`w-full rounded-sm border border-line bg-paper px-3 py-2 text-left transition-colors hover:border-ink/30 ${
                  muted ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate">{formatShortDate(f.date)}</span>
                  {f.status === "SoldOut" || f.registered >= f.capacity ? (
                    <span className="font-mono text-[9px] uppercase tracking-wide text-soldout">Sold out</span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-sm font-medium text-ink">{f.title}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate">
                  <MapPin size={11} className="shrink-0" />
                  {f.location}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}