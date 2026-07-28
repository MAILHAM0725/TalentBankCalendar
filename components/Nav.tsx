"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className="border-b border-line bg-card/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-gold/50 bg-ink text-gold font-mono text-xs tracking-tight">
            TB
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg text-ink tracking-tight">Talentbank</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
              Fair Calendar · FY2026
            </span>
          </span>
        </Link>

        <nav className="flex items-center rounded-full border border-line bg-paper p-1 text-sm font-medium">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
              !isAdmin ? "bg-ink text-paper shadow-ledger" : "text-slate hover:text-ink"
            }`}
          >
            <LayoutGrid size={14} strokeWidth={2.25} />
            Public Calendar
          </Link>
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
              isAdmin ? "bg-ink text-paper shadow-ledger" : "text-slate hover:text-ink"
            }`}
          >
            <Settings size={14} strokeWidth={2.25} />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
