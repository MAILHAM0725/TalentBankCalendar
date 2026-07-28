import { sql } from "@vercel/postgres";
import { CareerFair, FairStatus, FairType } from "@/lib/types";
import { SEED_EVENTS } from "@/lib/seedData";

// Runs once per server instance: creates the table if it's missing, and
// seeds it with sample fairs the very first time (empty table only).
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS fairs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          date TEXT NOT NULL,
          location TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          capacity INTEGER NOT NULL,
          registered INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL
        );
      `;
      const { rows } = await sql`SELECT COUNT(*)::int AS count FROM fairs`;
      if (rows[0]?.count === 0) {
        for (const fair of SEED_EVENTS) {
          await sql`
            INSERT INTO fairs (id, title, type, date, location, description, capacity, registered, status)
            VALUES (${fair.id}, ${fair.title}, ${fair.type}, ${fair.date}, ${fair.location}, ${fair.description}, ${fair.capacity}, ${fair.registered}, ${fair.status})
            ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    })();
  }
  return schemaReady;
}

function rowToFair(row: any): CareerFair {
  return {
    id: row.id,
    title: row.title,
    type: row.type as FairType,
    date: row.date,
    location: row.location,
    description: row.description,
    capacity: row.capacity,
    registered: row.registered,
    status: row.status as FairStatus,
  };
}

export async function readFairs(): Promise<CareerFair[]> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM fairs ORDER BY date ASC`;
  return rows.map(rowToFair);
}

export async function getFair(id: string): Promise<CareerFair | null> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM fairs WHERE id = ${id}`;
  return rows[0] ? rowToFair(rows[0]) : null;
}

export async function createFair(input: Omit<CareerFair, "id" | "registered">): Promise<CareerFair> {
  await ensureSchema();
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const { rows } = await sql`
    INSERT INTO fairs (id, title, type, date, location, description, capacity, registered, status)
    VALUES (${id}, ${input.title}, ${input.type}, ${input.date}, ${input.location}, ${input.description}, ${input.capacity}, 0, ${input.status})
    RETURNING *;
  `;
  return rowToFair(rows[0]);
}

export async function updateFair(
  id: string,
  patch: Partial<CareerFair>
): Promise<{ fair: CareerFair | null; error?: string }> {
  await ensureSchema();
  const existing = await getFair(id);
  if (!existing) return { fair: null, error: "Fair not found." };

  const merged: CareerFair = { ...existing, ...patch, id: existing.id, registered: existing.registered };
  if (merged.capacity < existing.registered) {
    return { fair: null, error: `Capacity can't drop below the ${existing.registered} candidates already registered.` };
  }

  const { rows } = await sql`
    UPDATE fairs
    SET title = ${merged.title.trim()},
        type = ${merged.type},
        date = ${merged.date},
        location = ${merged.location.trim()},
        description = ${merged.description ?? ""},
        capacity = ${merged.capacity},
        status = ${merged.status}
    WHERE id = ${id}
    RETURNING *;
  `;
  return { fair: rowToFair(rows[0]) };
}

export async function deleteFair(id: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`DELETE FROM fairs WHERE id = ${id}`;
  return (result.rowCount ?? 0) > 0;
}

/**
 * Atomically claims one seat. The WHERE clause itself enforces "not cancelled,
 * not full" — so if two people register for the last seat at the same instant,
 * the database guarantees only one UPDATE actually matches a row. There's no
 * gap between "check" and "write" for a race to sneak into, unlike a plain
 * read-then-write approach.
 */
export async function registerFair(id: string): Promise<{ fair: CareerFair | null; error?: string }> {
  await ensureSchema();
  const { rows } = await sql`
    UPDATE fairs
    SET registered = registered + 1
    WHERE id = ${id} AND status = 'Published' AND registered < capacity
    RETURNING *;
  `;
  if (rows[0]) return { fair: rowToFair(rows[0]) };

  // Nothing matched — find out why, so the candidate gets a clear reason.
  const existing = await getFair(id);
  if (!existing) return { fair: null, error: "This fair no longer exists." };
  if (existing.status === "Cancelled") return { fair: null, error: "This fair has been cancelled." };
  return { fair: null, error: "This fair is sold out." };
}
