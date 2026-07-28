"use client";

import { useState } from "react";
import { CareerFair, FairStatus } from "@/lib/types";
import { formatShortDate } from "@/lib/dateUtils";
import { useStore } from "@/lib/store";
import StatusStamp from "./StatusStamp";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";

export default function EventsTable({ onEdit }: { onEdit: (fair: CareerFair) => void }) {
  const { events, updateEvent, deleteEvent } = useStore();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  async function handleUpdate(id: string, patch: Partial<CareerFair>) {
    const result = await updateEvent(id, patch);
    setRowErrors((prev) => {
      const next = { ...prev };
      if (result.ok) delete next[id];
      else next[id] = result.error ?? "Could not save that change.";
      return next;
    });
  }

  async function handleDelete(id: string) {
    const result = await deleteEvent(id);
    if (!result.ok) {
      setRowErrors((prev) => ({ ...prev, [id]: result.error ?? "Could not delete this fair." }));
    }
    setConfirmingDelete(null);
  }

  const sorted = events.slice().sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-paper px-6 py-12 text-center">
        <p className="font-display text-lg text-ink">No fairs on the calendar yet</p>
        <p className="mt-1 text-sm text-slate">Use the form above to add the first one.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-card shadow-ledger">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-paper text-left font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Fair</th>
            <th className="px-4 py-3 font-medium">Capacity</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((fair) => {
            const isFull = fair.registered >= fair.capacity;
            const autoSoldOut = isFull && fair.status === "Published";
            return (
              <tr key={fair.id} className={`border-b border-line last:border-0 ${fair.status === "Cancelled" ? "opacity-60" : ""}`}>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-ink">{formatShortDate(fair.date)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{fair.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-gold-deep">{fair.type}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={fair.registered}
                      value={fair.capacity}
                      onChange={(e) => handleUpdate(fair.id, { capacity: Math.max(fair.registered, Number(e.target.value)) })}
                      className="w-20 rounded-sm border border-line bg-paper px-2 py-1 font-mono text-xs text-ink"
                    />
                    <span className="font-mono text-xs text-slate">seats · {fair.registered} registered</span>
                  </div>
                  {autoSoldOut && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-soldout">
                      <AlertTriangle size={11} /> Full — showing as Sold Out to candidates
                    </p>
                  )}
                  {rowErrors[fair.id] && <p className="mt-1 text-[11px] text-cancelled">{rowErrors[fair.id]}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    <select
                      value={fair.status}
                      onChange={(e) => handleUpdate(fair.id, { status: e.target.value as FairStatus })}
                      className="rounded-sm border border-line bg-paper px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-ink"
                    >
                      <option value="Published">Published</option>
                      <option value="SoldOut">Sold Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <StatusStamp status={autoSoldOut ? "SoldOut" : fair.status} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => onEdit(fair)} className="text-slate hover:text-ink" aria-label={`Edit ${fair.title}`}>
                      <Pencil size={15} />
                    </button>
                    {confirmingDelete === fair.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(fair.id)}
                          className="rounded-sm bg-cancelled px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          Delete
                        </button>
                        <button onClick={() => setConfirmingDelete(null)} className="text-[11px] text-slate">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(fair.id)}
                        className="text-slate hover:text-cancelled"
                        aria-label={`Delete ${fair.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
