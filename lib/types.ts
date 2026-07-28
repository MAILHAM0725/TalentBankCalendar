export type FairStatus = "Published" | "SoldOut" | "Cancelled";

export type FairType =
  | "Career Fair"
  | "Tech & Engineering Expo"
  | "Campus Recruiting Day"
  | "Diversity & Inclusion Fair"
  | "Industry Night"
  | "Virtual Hiring Event";

export interface CareerFair {
  id: string;
  title: string;
  type: FairType;
  date: string; // ISO yyyy-mm-dd
  location: string;
  description: string;
  capacity: number;
  registered: number;
  status: FairStatus;
}

export const FAIR_TYPES: FairType[] = [
  "Career Fair",
  "Tech & Engineering Expo",
  "Campus Recruiting Day",
  "Diversity & Inclusion Fair",
  "Industry Night",
  "Virtual Hiring Event",
];

/**
 * The effective status a candidate/employer sees. An organizer can leave a
 * fair "Published" right up until it fills up on its own — this derives the
 * real-world state so the UI never shows an open Register button on a full
 * room, even if nobody remembered to flip the status by hand.
 */
export function effectiveStatus(fair: CareerFair): FairStatus {
  if (fair.status === "Cancelled") return "Cancelled";
  if (fair.status === "SoldOut" || fair.registered >= fair.capacity) return "SoldOut";
  return "Published";
}

export function seatsLeft(fair: CareerFair): number {
  return Math.max(0, fair.capacity - fair.registered);
}
