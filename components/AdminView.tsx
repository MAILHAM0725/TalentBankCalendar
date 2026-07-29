"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CareerFair } from "@/lib/types";
import { useStore } from "@/lib/store";
import AdminEventForm from "./AdminEventForm";
import EventsTable from "./EventsTable";
import { LogOut } from "lucide-react";

export default function AdminView() {
  const [editingFair, setEditingFair] = useState<CareerFair | null>(null);
  const { loadError } = useStore();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  function handleEdit(fair: CareerFair) {
    setEditingFair(fair);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-deep">Event organizer</span>
          <h1 className="mt-2 font-display text-4xl text-ink leading-[1.05]">Run the calendar</h1>
          <p className="mt-3 max-w-xl text-slate leading-relaxed">
            Add fairs, move dates, and update status here — changes appear on the public calendar right away.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-slate hover:border-ink/40 hover:text-ink"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>

      {loadError && (
        <p className="mt-4 rounded-sm border border-soldout/40 bg-soldout-bg px-3 py-2 text-sm text-soldout max-w-xl">
          {loadError}
        </p>
      )}

      <div ref={formRef} className="mt-8 scroll-mt-6">
        <AdminEventForm editingFair={editingFair} onDone={() => setEditingFair(null)} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-ink mb-4">All fairs on the calendar</h2>
         <EventsTable onEdit={handleEdit} />
      </div>
    </div>
  );
}
