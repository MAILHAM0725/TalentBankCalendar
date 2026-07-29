"use client";

import { useState } from "react";
import { CareerFair, effectiveStatus, seatsLeft } from "@/lib/types";
import { formatFullDate } from "@/lib/dateUtils";
import { useStore } from "@/lib/store";
import StatusStamp from "./StatusStamp";
import { X, MapPin, Users } from "lucide-react";

export default function EventDrawer({ fairs, onClose }: { fairs: CareerFair[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" />
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-card border-l border-line shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sticky top-0 bg-card z-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
            {formatFullDate(fairs[0].date)}
          </span>
          <button onClick={onClose} className="text-slate hover:text-ink" aria-label="Close details">
            <X size={18} />
          </button>
        </div>
        <div className="divide-y divide-line">
          {fairs.map((f) => (
            <FairDetail key={f.id} fair={f} />
          ))}
        </div>
      </div>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FairDetail({ fair }: { fair: CareerFair }) {
  const { registerForEvent, registeredIds, savedContact } = useStore();
  const [name, setName] = useState(savedContact?.name ?? "");
  const [email, setEmail] = useState(savedContact?.email ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const status = effectiveStatus(fair);
  const seats = seatsLeft(fair);
  const alreadyRegistered = registeredIds.includes(fair.id);
  const fillPct = Math.min(100, Math.round((fair.registered / fair.capacity) * 100));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) return setFieldError("Enter your name.");
    if (!EMAIL_RE.test(trimmedEmail)) return setFieldError("Enter a valid email.");

    setFieldError(null);
    setSubmitting(true);
    const result = await registerForEvent(fair.id, { name: trimmedName, email: trimmedEmail });
    setSubmitting(false);
    setMessage(result.ok ? "You're registered — check your inbox for a confirmation." : result.reason ?? null);
  }

  return (
    <div className={`px-5 py-5 ${status === "Cancelled" ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg text-ink leading-snug">{fair.title}</h3>
        <StatusStamp status={status} />
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold-deep">{fair.type}</p>

      <p className="mt-3 text-sm text-slate leading-relaxed">{fair.description}</p>

      <div className="mt-4 space-y-2 text-sm text-ink">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate" />
          {fair.location}
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-slate" />
          {status === "Cancelled"
            ? "Registration closed"
            : status === "SoldOut"
            ? "All seats claimed"
            : `${seats} of ${fair.capacity} seats left`}
        </div>
      </div>

      {status !== "Cancelled" && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
            <div
              className={`h-full rounded-full ${status === "SoldOut" ? "bg-soldout" : "bg-published"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5">
        {status === "Cancelled" ? (
          <div className="rounded-sm border border-cancelled/30 bg-cancelled-bg px-3 py-2.5 text-sm text-cancelled">
            This fair has been cancelled. Check back for a rescheduled date, or explore other fairs this month.
          </div>
        ) : alreadyRegistered ? (
          <div className="rounded-sm border border-published/30 bg-published-bg px-3 py-2.5 text-sm text-published font-medium">
            You're registered for this fair.
          </div>
        ) : status === "SoldOut" ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-sm border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-slate"
          >
            Sold out — no seats remaining
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate focus:outline-none focus:ring-1 focus:ring-ink"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate focus:outline-none focus:ring-1 focus:ring-ink"
            />
            {fieldError && <p className="text-xs text-cancelled">{fieldError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Registering…" : "Register for this fair"}
            </button>
          </form>
        )}
        {message && !alreadyRegistered && (
          <p className="mt-2 text-xs text-slate">{message}</p>
        )}
      </div>
    </div>
  );
}
