
import type { Booking, CheckResult, Room } from '@/types';

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_LENGTH = 120;

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  // Touching endpoints are allowed.
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number,
): CheckResult {
  // AC1: Validate interval and current time.
  if (!(0 <= start && start < end && end <= MINUTES_PER_DAY)) {
    return {
      available: false,
      reason: 'Invalid time interval. Start must be before end, and both within 00:00–24:00.',
    };
  }

  if (start <= currentTime) {
    return {
      available: false,
      reason: 'Start time must be after the current time.',
    };
  }

  // AC2: Maximum booking duration is 120 minutes.
  if (end - start > MAX_BOOKING_LENGTH) {
    return {
      available: false,
      reason: `Booking exceeds the ${MAX_BOOKING_LENGTH}-minute maximum (requested ${end - start} min).`,
    };
  }

  // AC3: Blocked rooms are unavailable.
  if (room.blocked) {
    return {
      available: false,
      reason: `Room is blocked: ${room.blockedReason ?? 'unavailable for booking.'}`,
    };
  }

  // AC4: Check overlap without modifying bookings.
  const conflict = room.bookings.find((b: Booking) =>
    intervalsOverlap(start, end, b.start, b.end),
  );

  if (conflict) {
    return {
      available: false,
      reason: `Overlaps existing booking "${conflict.title}" (${fmt(conflict.start)}–${fmt(conflict.end)}).`,
    };
  }

  const duration = end - start;

  // AC5: Return the result without modifying booking data.
  return {
    available: true,
    reason: `Room is available for ${duration} min (${fmt(start)}–${fmt(end)}).`,
  };
}

export function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
