import type { Room, Booking, AvailabilityResult, CheckInputs } from './types';
import { MAX_BOOKING_MINUTES } from './constants';
import { validateBookingInputs } from './validation';

/**
 * Decides whether a candidate interval can be booked for the given room.
 * Input validation lives in validation.ts; this module applies the business
 * rules (duration cap, blocked room, overlap) on top of it.
 *
 * AC2: reject bookings longer than 120 minutes.
 * AC3: reject blocked rooms.
 * AC4: reject overlapping bookings (touching endpoints allowed).
 */
export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number,
  bookings: Booking[]
): AvailabilityResult {
  const issue = validateBookingInputs(room?.id ?? null, start, end, currentTime);
  if (issue) {
    return { available: false, reasonCode: issue.code, message: issue.message };
  }

  if (end - start > MAX_BOOKING_MINUTES) {
    return {
      available: false,
      reasonCode: 'INVALID_DURATION',
      message: `Bookings cannot be longer than ${MAX_BOOKING_MINUTES} minutes.`,
    };
  }

  if (room!.blocked) {
    return {
      available: false,
      reasonCode: 'ROOM_BLOCKED',
      message: 'This room is currently blocked and cannot be booked.',
    };
  }

  const overlaps = bookings.some(
    (b) => b.roomId === room!.id && b.start < end && start < b.end
  );
  if (overlaps) {
    return {
      available: false,
      reasonCode: 'BOOKING_OVERLAP',
      message: 'The interval overlaps an existing booking.',
    };
  }

  return {
    available: true,
    reasonCode: 'AVAILABLE',
    message: 'This room is available for the selected interval.',
  };
}

export function isSameCheck(a: CheckInputs, b: CheckInputs): boolean {
  return (
    a.roomId === b.roomId &&
    a.start === b.start &&
    a.end === b.end &&
    a.currentTime === b.currentTime
  );
}
