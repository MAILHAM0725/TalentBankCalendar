"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CareerFair, FairType } from "@/lib/types";
import { MONTH_NAMES } from "@/lib/dateUtils";
import FilterBar from "./FilterBar";
import MonthCard from "./MonthCard";
import EventDrawer from "./EventDrawer";
import CalendarHighlights from "./CalendarHighlights";

const YEAR = 2026;

export default function PublicCalendarView() {
  const { events, loaded, loadError } = useStore();
  const [activeTypes, setActiveTypes] = useState<FairType[]>([]);
  const [selectedDay, setSelectedDay] = useState<CareerFair[] | null>(null);

  const filtered = useMemo(
    () => events.filter((e) => activeTypes.length === 0 || activeTypes.includes(e.type)),
    [events, activeTypes]
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, CareerFair[]> = {};
    filtered
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((e) => {
        (map[e.date] = map[e.date] || []).push(e);
      });
    return map;
  }, [filtered]);

  function toggleType(t: FairType) {
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <div className="max-w-2xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-deep">
          Candidates &amp; Employers
        </span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl text-ink leading-[1.05]">
          The {YEAR} fair calendar,
          <br />
          laid out like a ledger.
        </h1>
        <p className="mt-4 text-slate leading-relaxed">
          Every Talentbank career fair this year, at a glance. Filter by type, tap a date to see who's hiring,
          and register in a couple of clicks.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar activeTypes={activeTypes} onToggle={toggleType} onClear={() => setActiveTypes([])} />
        <Legend />
      </div>

      {loadError && (
        <p className="mt-6 rounded-sm border border-soldout/40 bg-soldout-bg px-3 py-2 text-sm text-soldout">{loadError}</p>
      )}

      {loaded && (
        <div className="mt-8">
          <CalendarHighlights
            fairs={filtered}
            onSelect={(fair) => setSelectedDay(eventsByDate[fair.date] ?? [fair])}
          />
        </div>
      )}

      {!loaded ? (
        <div className="mt-10 font-mono text-xs uppercase tracking-widest text-slate">Loading calendar…</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MONTH_NAMES.map((_, month) => (
            <MonthCard key={month} year={YEAR} month={month} eventsByDate={eventsByDate} onSelectDay={setSelectedDay} />
          ))}
        </div>
      )}

      {selectedDay && <EventDrawer fairs={selectedDay} onClose={() => setSelectedDay(null)} />}
    </div>
  );
}

function Legend() {
  const items: { label: string; dot: string }[] = [
    { label: "Published", dot: "bg-published" },
    { label: "Sold out", dot: "bg-soldout" },
    { label: "Cancelled", dot: "bg-cancelled" },
  ];
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide text-slate">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${i.dot}`} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
