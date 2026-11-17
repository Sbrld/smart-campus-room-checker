import type { AvailabilityResult, Booking, Room } from '@/types';
import { DAY_MINUTES, MAX_BOOKING_MINUTES } from '@/data';
import { toHHMM } from '@/lib/format';

interface Interval {
  start: number;
  end: number;
}

function overlaps(a: Interval, b: Interval): boolean {
  // Touching endpoints are allowed, so strict inequality.
  return a.start < b.end && b.start < a.end;
}

export function bookingsForRoom(bookings: Booking[], roomId: string): Booking[] {
  return bookings.filter((b) => b.roomId === roomId);
}

export function checkAvailability(
  room: Room | null,
  candidate: Interval,
  currentTime: number,
  existingBookings: Booking[],
): AvailabilityResult {
  const { start, end } = candidate;

  // AC1: 0 <= start < end <= 1440 and start must be after the supplied current time.
  if (start < 0 || end > DAY_MINUTES || start >= end) {
    return { available: false, reason: 'Interval must satisfy 0 ≤ start < end ≤ 1440.' };
  }
  if (start <= currentTime) {
    return {
      available: false,
      reason: 'Start time must be after the current time.',
    };
  }

  if (!room) {
    return { available: false, reason: 'Please select a room.' };
  }

  // AC2: reject bookings longer than 120 minutes.
  if (end - start > MAX_BOOKING_MINUTES) {
    return {
      available: false,
      reason: `Booking cannot exceed ${MAX_BOOKING_MINUTES} minutes.`,
    };
  }

  // AC3: reject when the room is blocked.
  if (room.blocked) {
    return {
      available: false,
      reason: `${room.name} is currently blocked and unavailable for booking.`,
    };
  }

  // AC4: reject intervals overlapping existing bookings (touching allowed).
  const conflict = bookingsForRoom(existingBookings, room.id).find((b) => overlaps(candidate, b));
  if (conflict) {
    return {
      available: false,
      reason: `Overlaps an existing booking (${toHHMM(conflict.start)}–${toHHMM(conflict.end)} by ${conflict.bookedBy}).`,
    };
  }

  // AC5: available decision, no mutation of booking data.
  return { available: true };
}


