"use client";

import { FairType } from "@/lib/types";

export default function FilterBar({
  activeTypes,
  onToggle,
  onClear,
}: {
  activeTypes: FairType[];
  onToggle: (t: FairType) => void;
  onClear: () => void;
}) {
  const ALL: FairType[] = [
    "Career Fair",
    "Tech & Engineering Expo",
    "Campus Recruiting Day",
    "Diversity & Inclusion Fair",
    "Industry Night",
    "Virtual Hiring Event",
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate mr-1">Filter by type</span>
      {ALL.map((t) => {
        const active = activeTypes.includes(t);
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-ink bg-ink text-paper"
                : "border-line bg-card text-slate hover:border-ink/40 hover:text-ink"
            }`}
          >
            {t}
          </button>
        );
      })}
      {activeTypes.length > 0 && (
        <button onClick={onClear} className="text-xs font-medium text-slate underline underline-offset-2 hover:text-ink">
          Clear filters
        </button>
      )}
    </div>
  );
}
