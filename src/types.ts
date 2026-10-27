export interface Booking {
  id: string;
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
  title: string;
  bookedBy: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
}

export type CheckResult =
  | { available: true; reason: string }
  | { available: false; reason: string };
