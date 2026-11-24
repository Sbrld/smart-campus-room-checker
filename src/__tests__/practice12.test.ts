import { describe, it, expect } from 'vitest';
import { checkAvailability } from '../availability';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS } from '../data';
import type { Booking } from '../types';

const CURRENT_TIME = 480;

const lectureHallA = SAMPLE_ROOMS.find((r) => r.id === 'r1')!;
const conferenceRoomB = SAMPLE_ROOMS.find((r) => r.id === 'r3')!;
const hallBookings: Booking[] = SAMPLE_BOOKINGS.filter((b) => b.roomId === 'r1');

describe('Practice 12 acceptance tests (T1–T8)', () => {
  it('T1: 630–690 on open Lecture Hall A is Available', () => {
    const result = checkAvailability(lectureHallA, 630, 690, CURRENT_TIME, hallBookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('T2: 570–630 overlapping 540–600 booking is Unavailable (BOOKING_OVERLAP)', () => {
    const result = checkAvailability(lectureHallA, 570, 630, CURRENT_TIME, hallBookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('BOOKING_OVERLAP');
  });

  it('T3: 840–900 on blocked Conference Room B is Unavailable (ROOM_BLOCKED)', () => {
    const result = checkAvailability(conferenceRoomB, 840, 900, CURRENT_TIME, SAMPLE_BOOKINGS);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('ROOM_BLOCKED');
  });

  it('T4: 840–840 zero-length interval is a validation error (INVALID_INPUT)', () => {
    const result = checkAvailability(lectureHallA, 840, 840, CURRENT_TIME, hallBookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
  });

  it('T5: 840–961 (121 min) is a validation error (INVALID_DURATION)', () => {
    const result = checkAvailability(lectureHallA, 840, 961, CURRENT_TIME, hallBookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_DURATION');
  });

  it('T6: 450–480 starting at current time is a validation error (PAST_START_TIME)', () => {
    const result = checkAvailability(lectureHallA, 450, 480, CURRENT_TIME, hallBookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('PAST_START_TIME');
  });

  it('T7: 600–720 adjacent 120 min between both bookings is Available', () => {
    const result = checkAvailability(lectureHallA, 600, 720, CURRENT_TIME, hallBookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('T8: booking data is unchanged after all checks', () => {
    const before = JSON.parse(JSON.stringify(SAMPLE_BOOKINGS));
    checkAvailability(lectureHallA, 630, 690, CURRENT_TIME, SAMPLE_BOOKINGS);
    checkAvailability(lectureHallA, 570, 630, CURRENT_TIME, SAMPLE_BOOKINGS);
    checkAvailability(conferenceRoomB, 840, 900, CURRENT_TIME, SAMPLE_BOOKINGS);
    checkAvailability(lectureHallA, 840, 840, CURRENT_TIME, SAMPLE_BOOKINGS);
    checkAvailability(lectureHallA, 840, 961, CURRENT_TIME, SAMPLE_BOOKINGS);
    checkAvailability(lectureHallA, 450, 480, CURRENT_TIME, SAMPLE_BOOKINGS);
    checkAvailability(lectureHallA, 600, 720, CURRENT_TIME, SAMPLE_BOOKINGS);
    expect(SAMPLE_BOOKINGS).toEqual(before);
    expect(SAMPLE_BOOKINGS.length).toBe(6);
  });
});
