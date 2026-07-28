"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CareerFair } from "./types";
import { SEED_EVENTS } from "./seedData";

const REGISTERED_KEY = "talentbank-calendar-registered-v1";
const POLL_MS = 15000;

type MutationResult = { ok: boolean; error?: string };

interface StoreShape {
  events: CareerFair[];
  loaded: boolean;
  loadError: string | null;
  addEvent: (fair: Omit<CareerFair, "id" | "registered">) => Promise<MutationResult>;
  updateEvent: (id: string, patch: Partial<CareerFair>) => Promise<MutationResult>;
  deleteEvent: (id: string) => Promise<MutationResult>;
  registerForEvent: (id: string) => Promise<{ ok: boolean; reason?: string }>;
  registeredIds: string[];
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Seeded so the calendar has something to show the instant the page paints;
  // replaced by the real shared data as soon as the first fetch resolves.
  const [events, setEvents] = useState<CareerFair[]>(SEED_EVENTS);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/fairs", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setEvents(data.fairs);
      setLoadError(null);
    } catch {
      setLoadError("Couldn't reach the calendar's server. Showing the last data loaded.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REGISTERED_KEY);
      if (raw) setRegisteredIds(JSON.parse(raw));
    } catch {
      // Ignore malformed storage.
    }

    refresh();
    pollRef.current = setInterval(refresh, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  function persistRegisteredIds(ids: string[]) {
    setRegisteredIds(ids);
    window.localStorage.setItem(REGISTERED_KEY, JSON.stringify(ids));
  }

  async function addEvent(fair: Omit<CareerFair, "id" | "registered">): Promise<MutationResult> {
    const res = await fetch("/api/fairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fair),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "Could not add this fair." };
    await refresh();
    return { ok: true };
  }

  async function updateEvent(id: string, patch: Partial<CareerFair>): Promise<MutationResult> {
    const res = await fetch(`/api/fairs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "Could not save changes." };
    await refresh();
    return { ok: true };
  }

  async function deleteEvent(id: string): Promise<MutationResult> {
    const res = await fetch(`/api/fairs/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "Could not delete this fair." };
    await refresh();
    return { ok: true };
  }

  async function registerForEvent(id: string): Promise<{ ok: boolean; reason?: string }> {
    if (registeredIds.includes(id)) return { ok: false, reason: "You're already registered." };
    const res = await fetch(`/api/fairs/${id}/register`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, reason: data.error ?? "Could not complete registration." };
    persistRegisteredIds([...registeredIds, id]);
    await refresh();
    return { ok: true };
  }

  return (
    <StoreContext.Provider
      value={{ events, loaded, loadError, addEvent, updateEvent, deleteEvent, registerForEvent, registeredIds, refresh }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
