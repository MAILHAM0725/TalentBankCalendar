"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-deep">Event organizer</span>
      <h1 className="mt-2 font-display text-3xl text-ink">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate">Enter the shared organizer password to manage the calendar.</p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-md border border-line bg-card shadow-ledger p-5">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="tb-input"
            autoFocus
          />
        </label>

        {error && (
          <p className="mt-3 rounded-sm border border-cancelled/30 bg-cancelled-bg px-3 py-2 text-sm text-cancelled">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-60"
        >
          <Lock size={15} />
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
