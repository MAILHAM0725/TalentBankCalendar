import { FAIR_TYPES, FairStatus, FairType } from "@/lib/types";

const STATUSES: FairStatus[] = ["Published", "SoldOut", "Cancelled"];

export interface FairInput {
  title: string;
  type: FairType;
  date: string;
  location: string;
  description: string;
  capacity: number;
  status: FairStatus;
}

/** Validates the fields a client can set on a fair. Returns an error message, or null if valid. */
export function validateFairInput(body: any): string | null {
  if (typeof body?.title !== "string" || !body.title.trim()) return "Fair name is required.";
  if (!FAIR_TYPES.includes(body?.type)) return "Fair type is not recognized.";
  if (typeof body?.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return "Date must be a valid calendar date.";
  if (typeof body?.location !== "string" || !body.location.trim()) return "Location is required.";
  if (typeof body?.capacity !== "number" || !Number.isFinite(body.capacity) || body.capacity < 1) {
    return "Capacity must be a number of at least 1.";
  }
  if (!STATUSES.includes(body?.status)) return "Status is not recognized.";
  return null;
}
