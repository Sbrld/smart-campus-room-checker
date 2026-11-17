import { describe, expect, it } from 'vitest';
import { checkAvailability } from '@/lib/checkAvailability';
import type { Booking, Room } from '@/types';

const CURRENT_TIME = 540;

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'B204',
    name: 'Lab B204',
    building: 'Engineering Block',
    capacity: 40,
    equipment: [],
    blocked: false,
    ...overrides,
  };
}

function makeBookings(): Booking[] {
  return [
    { id: 'b3', roomId: 'B204', start: 600, end: 660, bookedBy: 'Robotics Team' },
  ];
}

describe('Practice 07 improved suite', () => {
  describe('touching endpoints are allowed', () => {
    it.each([
      { name: 'T01: touches after existing booking', start: 660, end: 720 },
      { name: 'T08: touches before existing booking', start: 570, end: 600 },
    ])('$name', ({ start, end }) => {
      const result = checkAvailability(
        makeRoom(),
        { start, end },
        CURRENT_TIME,
        makeBookings(),
      );
      expect(result.available).toBe(true);
    });
  });

  it('T02: start exactly at current time is unavailable', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 540, end: 570 },
      CURRENT_TIME,
      makeBookings(),
    );
    expect(result.available).toBe(false);
  });

  describe('invalid intervals', () => {
    it.each([
      { name: 'T03: zero duration', start: 720, end: 720 },
      { name: 'T04: reversed start/end', start: 750, end: 720 },
      { name: 'T05: end exceeds 1440', start: 1380, end: 1441 },
    ])('$name', ({ start, end }) => {
      const result = checkAvailability(
        makeRoom(),
        { start, end },
        CURRENT_TIME,
        makeBookings(),
      );
      expect(result.available).toBe(false);
    });
  });

  it('T06: exactly 120 minutes is available', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 720, end: 840 },
      CURRENT_TIME,
      makeBookings(),
    );
    expect(result.available).toBe(true);
  });

  it('T07: 121 minutes is unavailable', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 720, end: 841 },
      CURRENT_TIME,
      makeBookings(),
    );
    expect(result.available).toBe(false);
  });

  describe('overlapping intervals are rejected', () => {
    it.each([
      { name: 'T09: partial overlap', start: 630, end: 690 },
      { name: 'T10: contains existing booking', start: 570, end: 690 },
      { name: 'T11: inside existing booking', start: 615, end: 645 },
      { name: 'T12: identical to existing booking', start: 600, end: 660 },
    ])('$name', ({ start, end }) => {
      const result = checkAvailability(
        makeRoom(),
        { start, end },
        CURRENT_TIME,
        makeBookings(),
      );
      expect(result.available).toBe(false);
    });
  });

  it('T13: blocked room is unavailable', () => {
    const result = checkAvailability(
      makeRoom({ blocked: true }),
      { start: 660, end: 720 },
      CURRENT_TIME,
      makeBookings(),
    );
    expect(result.available).toBe(false);
  });

  it('T14: no existing bookings is available', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 630, end: 690 },
      CURRENT_TIME,
      [],
    );
    expect(result.available).toBe(true);
  });

  it('T15: does not mutate booking data (deep equality)', () => {
    const existing = makeBookings();
    const snapshot: Booking[] = structuredClone(existing);
    checkAvailability(
      makeRoom(),
      { start: 660, end: 720 },
      CURRENT_TIME,
      existing,
    );
    expect(existing).toEqual(snapshot);
  });

  it('T16: last minute of the day (1439–1440) with empty bookings is available', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 1439, end: 1440 },
      CURRENT_TIME,
      [],
    );
    expect(result.available).toBe(true);
  });

  it('T17: start 0, current time 0, empty bookings is unavailable', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 0, end: 30 },
      0,
      [],
    );
    expect(result.available).toBe(false);
  });

  it('T18: candidate outside non-chronological bookings is available and bookings are unchanged', () => {
    const existing: Booking[] = [
      { id: 'b1', roomId: 'B204', start: 900, end: 960, bookedBy: 'Robotics Team' },
      { id: 'b2', roomId: 'B204', start: 600, end: 660, bookedBy: 'Design Squad' },
    ];
    const snapshot: Booking[] = structuredClone(existing);
    const result = checkAvailability(
      makeRoom(),
      { start: 720, end: 780 },
      CURRENT_TIME,
      existing,
    );
    expect(result.available).toBe(true);
    expect(existing).toEqual(snapshot);
  });

  it('T19: start before the current time is unavailable', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: 500, end: 560 },
      CURRENT_TIME,
      makeBookings(),
    );
    expect(result.available).toBe(false);
  });

  it('T20: negative start is unavailable', () => {
    const result = checkAvailability(
      makeRoom(),
      { start: -10, end: 30 },
      0,
      [],
    );
    expect(result.available).toBe(false);
  });
});
