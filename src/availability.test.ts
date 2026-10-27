import { describe, it, expect } from 'vitest';
import { checkAvailability } from '@/availability';
import type { Room } from '@/types';

const CURRENT_TIME = 540;

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'test-room',
    name: 'Test Room',
    building: 'Test Building',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b1', start: 600, end: 660, title: 'Existing Booking', bookedBy: 'Tester' },
    ],
    ...overrides,
  };
}

describe('checkAvailability', () => {
  it('T01: touching start at existing end — available', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  it('T02: start not after current time — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 540, 570, CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('Start time must be after the current time.');
  });

  it('T03: start equals end — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 720, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T04: start after end — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 750, 720, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T05: end exceeds 1440 — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 1380, 1441, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T06: exactly 120 minutes — available', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 840, CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  it('T07: 121 minutes exceeds max — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 841, CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('Booking exceeds the 120-minute maximum (requested 121 min).');
  });

  it('T08: touching end at existing start — available', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 600, CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  it('T09: partial overlap with existing booking — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 630, 690, CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('Overlaps existing booking "Existing Booking" (10:00–11:00).');
  });

  it('T10: fully overlaps existing booking — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 690, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T11: fully inside existing booking — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 615, 645, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T12: exact same interval as existing booking — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 600, 660, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T13: blocked room — unavailable', () => {
    const room = makeRoom({ blocked: true });
    const result = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reason).toBe('Room is blocked: unavailable for booking.');
  });

  it('T14: no existing bookings — available', () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 630, 690, CURRENT_TIME);
    expect(result.available).toBe(true);
  });

  it('T15: does not modify original bookings array', () => {
    const room = makeRoom();
    const originalBookings = room.bookings.map((b) => ({ ...b }));
    const result = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(room.bookings).toEqual(originalBookings);
  });

  it('T16: start one minute before current time — unavailable', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 539, 570, CURRENT_TIME);
    expect(result.available).toBe(false);
  });

  it('T17: end at day boundary — available', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 1320, 1440, CURRENT_TIME);
    expect(result.available).toBe(true);
  });
});
