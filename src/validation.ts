import { DAY_END_MINUTES } from './constants';
import type { ReasonCode } from './types';

export interface InputIssue {
  code: ReasonCode;
  message: string;
}

/**
 * Validates the raw booking inputs before any availability business rule runs.
 * Returns the first structural problem found, or null when the inputs are
 * well-formed. Purely structural: duration limits, blocked rooms and overlaps
 * are decided in availability.ts.
 */
export function validateBookingInputs(
  roomId: string | null,
  start: number,
  end: number,
  currentTime: number
): InputIssue | null {
  if (!roomId) {
    return { code: 'NO_ROOM_SELECTED', message: 'Please select a room first.' };
  }

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !Number.isFinite(currentTime)
  ) {
    return {
      code: 'INVALID_INPUT',
      message: 'Times must be valid numbers.',
    };
  }

  if (start < 0 || end > DAY_END_MINUTES || start >= end) {
    return {
      code: 'INVALID_INPUT',
      message: `Interval must satisfy 0 ≤ start < end ≤ ${DAY_END_MINUTES} (minutes of day).`,
    };
  }

  if (start <= currentTime) {
    return {
      code: 'PAST_START_TIME',
      message: `Start time must be strictly after the current time (${currentTime} min).`,
    };
  }

  return null;
}
