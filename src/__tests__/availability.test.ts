import { describe, it, expect } from 'vitest';
import { checkAvailability } from '../availability';
import type { Room, Booking } from '../types';

// ─── Default fixture (fresh per test) ───────────────────────────
const CURRENT_TIME = 540; // 09:00

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'r1',
    name: 'Test Room',
    building: 'Test Building',
    capacity: 50,
    equipment: [],
    blocked: false,
    ...overrides,
  };
}

function makeBookings(): Booking[] {
  return [{ id: 'b1', roomId: 'r1', start: 600, end: 660 }]; // 10:00–11:00
}

// ─── Tests ──────────────────────────────────────────────────────
describe('checkAvailability — AC1–AC6 case table', () => {
  // T01 — 660–720, touching after existing booking → Available
  it('T01: 660–720 touching after existing booking is available', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message.length).toBeGreaterThan(0);
  });

  // T02 — 540–570, starts at current time → Unavailable (start must be strictly after now)
  it('T02: 540–570 starts at current time is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 540, 570, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('PAST_START_TIME');
    expect(result.message).toContain('strictly after');
  });

  // T03 — 720–720, zero duration → Unavailable
  it('T03: 720–720 zero duration is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 720, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
    expect(result.message).toContain('Interval must satisfy');
  });

  // T04 — 750–720, reversed interval → Unavailable
  it('T04: 750–720 reversed interval is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 750, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
    expect(result.message).toContain('Interval must satisfy');
  });

  // T05 — 1380–1441, past day end → Unavailable
  it('T05: 1380–1441 past day end is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 1380, 1441, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
    expect(result.message).toContain('Interval must satisfy');
  });

  // T06 — 720–840, exactly 120 minutes → Available
  it('T06: 720–840 exactly 120 minutes is available', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 720, 840, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message.length).toBeGreaterThan(0);
  });

  // T07 — 720–841, 121 minutes → Unavailable
  it('T07: 720–841 121 minutes is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 720, 841, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_DURATION');
    expect(result.message).toContain('longer than 120');
  });

  // T08 — 570–600, touching before existing booking → Available
  it('T08: 570–600 touching before existing booking is available', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 570, 600, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message.length).toBeGreaterThan(0);
  });

  // T09 — 630–690, partial overlap → Unavailable
  it('T09: 630–690 partial overlap is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 630, 690, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('BOOKING_OVERLAP');
    expect(result.message).toContain('overlaps');
  });

  // T10 — 570–690, contains existing booking → Unavailable
  it('T10: 570–690 contains existing booking is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 570, 690, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('BOOKING_OVERLAP');
    expect(result.message).toContain('overlaps');
  });

  // T11 — 615–645, inside existing booking → Unavailable
  it('T11: 615–645 inside existing booking is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 615, 645, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('BOOKING_OVERLAP');
    expect(result.message).toContain('overlaps');
  });

  // T12 — 600–660, identical interval → Unavailable
  it('T12: 600–660 identical interval is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 600, 660, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('BOOKING_OVERLAP');
    expect(result.message).toContain('overlaps');
  });

  // T13 — 660–720, blocked room → Unavailable
  // R-06: Assert the reason code comes from AC3, not a coincidental AC4 trigger.
  it('T13: 660–720 blocked room is unavailable with blocked reason only', () => {
    const room = makeRoom({ blocked: true });
    const bookings = makeBookings();
    const result = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('ROOM_BLOCKED');
    expect(result.message).toContain('blocked');
  });

  // T14 — 630–690, no existing bookings → Available
  it('T14: 630–690 with no existing bookings is available', () => {
    const room = makeRoom();
    const bookings: Booking[] = [];
    const result = checkAvailability(room, 630, 690, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message.length).toBeGreaterThan(0);
  });

  // T15 — Booking data remains unchanged after a check (AC5)
  // R-04: Verify data preservation after both an available and an unavailable result.
  it('T15: existing booking data remains unchanged after available and unavailable checks', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const snapshot = JSON.parse(JSON.stringify(bookings));

    // Available path
    checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(bookings).toEqual(snapshot);
    expect(bookings.length).toBe(1);

    // Unavailable path (overlap)
    checkAvailability(room, 630, 690, CURRENT_TIME, bookings);
    expect(bookings).toEqual(snapshot);
    expect(bookings.length).toBe(1);
  });

  // T16 — 0–60, starts before current time → Unavailable
  it('T16: 0–60 starts before current time is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 0, 60, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('PAST_START_TIME');
    expect(result.message).toContain('strictly after');
  });

  // T17 — 660–720, overlap exists only for a different room → Available
  it('T17: 660–720 with overlap only in another room is available', () => {
    const room = makeRoom({ id: 'r2' });
    const bookings: Booking[] = [
      { id: 'b1', roomId: 'r1', start: 600, end: 660 },
      { id: 'b2', roomId: 'r1', start: 670, end: 710 },
    ];
    const result = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message.length).toBeGreaterThan(0);
  });

  // T18 — -1–60, negative start time → Unavailable (R-02)
  it('T18: -1–60 negative start time is unavailable', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, -1, 60, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
    expect(result.message).toContain('Interval must satisfy');
  });

  // T19 — 1381–1440, exact end-of-day boundary → Available (R-03)
  it('T19: 1381–1440 ending exactly at day end is available', () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 1381, 1440, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
    expect(result.message.length).toBeGreaterThan(0);
  });

  // T20 — NaN start reaches the checker when called directly → INVALID_INPUT
  it('T20: NaN start time is reported as invalid input', () => {
    const room = makeRoom();
    const result = checkAvailability(room, NaN, 660, CURRENT_TIME, makeBookings());
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_INPUT');
    expect(result.message.length).toBeGreaterThan(0);
  });
});
