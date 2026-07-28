"use client";

import { useEffect, useMemo, useState } from "react";
import { CareerFair, FAIR_TYPES, FairStatus, FairType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Save, X, AlertTriangle, Info } from "lucide-react";

const EMPTY = {
  title: "",
  type: "Career Fair" as FairType,
  date: "",
  location: "",
  description: "",
  capacity: 200,
  status: "Published" as FairStatus,
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function AdminEventForm({ editingFair, onDone }: { editingFair: CareerFair | null; onDone: () => void }) {
  const { addEvent, updateEvent, events } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgeClash, setAcknowledgeClash] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingFair) {
      const { title, type, date, location, description, capacity, status } = editingFair;
      setForm({ title, type, date, location, description, capacity, status });
    } else {
      setForm(EMPTY);
    }
    setError(null);
    setAcknowledgeClash(false);
  }, [editingFair]);

  // Any other live fair sharing this fair's date — the basis for clash warnings.
  const sameDayFairs = useMemo(
    () =>
      events.filter(
        (e) => e.date === form.date && e.date !== "" && e.id !== editingFair?.id && e.status !== "Cancelled"
      ),
    [events, form.date, editingFair]
  );
  const venueClashes = useMemo(
    () => sameDayFairs.filter((e) => normalize(e.location) === normalize(form.location) && form.location.trim() !== ""),
    [sameDayFairs, form.location]
  );
  const otherClashes = sameDayFairs.filter((e) => !venueClashes.includes(e));

  // A fresh venue clash (different fair/date than what was already acknowledged) needs re-confirming.
  useEffect(() => {
    setAcknowledgeClash(false);
  }, [venueClashes.length]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Give the fair a name.");
    if (!form.date) return setError("Pick a date.");
    if (!form.location.trim()) return setError("Add a location (or \"Online\").");
    if (form.capacity < 1) return setError("Capacity must be at least 1 seat.");

    if (editingFair && form.capacity < editingFair.registered) {
      return setError(
        `Capacity can't drop below the ${editingFair.registered} candidates already registered. Raise it, or move registrants first.`
      );
    }

    if (venueClashes.length > 0 && !acknowledgeClash) {
      return setError("This double-books a venue — check the box below to confirm before saving.");
    }

    setSubmitting(true);
    const result = editingFair ? await updateEvent(editingFair.id, form) : await addEvent(form);
    setSubmitting(false);

    if (!result.ok) return setError(result.error ?? "Something went wrong saving this fair.");
    if (!editingFair) {
      setForm(EMPTY);
      setAcknowledgeClash(false);
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-line bg-card shadow-ledger p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">{editingFair ? "Edit fair" : "Add a new fair"}</h2>
        {editingFair && (
          <button type="button" onClick={onDone} className="text-slate hover:text-ink" aria-label="Cancel edit">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fair name" span2>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Mid-Year Career Fair"
            className="tb-input"
          />
        </Field>

        <Field label="Type">
          <select value={form.type} onChange={(e) => set("type", e.target.value as FairType)} className="tb-input">
            {FAIR_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date">
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="tb-input" />
        </Field>

        <Field label="Location" span2>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Venue name, city — or “Online”"
            className="tb-input"
          />
        </Field>

        <Field label="Capacity (seats)">
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => set("capacity", Number(e.target.value))}
            className="tb-input"
          />
        </Field>

        <Field label="Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value as FairStatus)} className="tb-input">
            <option value="Published">Published</option>
            <option value="SoldOut">Sold Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </Field>

        <Field label="Description" span2>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="A line or two candidates will see on the calendar."
            className="tb-input resize-none"
          />
        </Field>
      </div>

      {otherClashes.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-sm border border-line bg-paper px-3 py-2.5 text-sm text-slate">
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>
            Also on this day: {otherClashes.map((e) => e.title).join(", ")}. Candidates will see both — no action needed.
          </span>
        </div>
      )}

      {venueClashes.length > 0 && (
        <div className="mt-4 rounded-sm border border-soldout/40 bg-soldout-bg px-3 py-2.5 text-sm text-soldout">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              This double-books {form.location || "this venue"} — {venueClashes.map((e) => e.title).join(", ")} is
              already scheduled there the same day.
            </span>
          </div>
          <label className="mt-2 flex items-center gap-2 pl-6 text-soldout">
            <input type="checkbox" checked={acknowledgeClash} onChange={(e) => setAcknowledgeClash(e.target.checked)} />
            I understand and want to book it anyway
          </label>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-sm border border-cancelled/30 bg-cancelled-bg px-3 py-2 text-sm text-cancelled">{error}</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-60"
        >
          <Save size={15} />
          {submitting ? "Saving…" : editingFair ? "Save changes" : "Add fair to calendar"}
        </button>
        {editingFair && (
          <button type="button" onClick={onDone} className="text-sm font-medium text-slate hover:text-ink">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${span2 ? "sm:col-span-2" : ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">{label}</span>
      {children}
    </label>
  );
}
