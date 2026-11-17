import { describe, expect, it } from 'vitest';
import { MAX_ATTENDEES, filterRooms, findMatchingRooms, parseAttendees } from '@/lib/roomFilters';
import type { Room } from '@/types';

function makeRoom(overrides: Partial<Room>): Room {
  return {
    id: 'R1',
    name: 'Room 1',
    building: 'Test Block',
    capacity: 10,
    equipment: [],
    blocked: false,
    ...overrides,
  };
}

const rooms: Room[] = [
  makeRoom({ id: 'R1', capacity: 120, equipment: ['Projector', 'Whiteboard'] }),
  makeRoom({ id: 'R2', capacity: 40, equipment: ['Projector'] }),
  makeRoom({ id: 'R3', capacity: 8, equipment: ['Whiteboard'], blocked: true }),
];

describe('parseAttendees', () => {
  it.each([
    { input: '', value: null },
    { input: '   ', value: null },
    { input: '12', value: 12 },
    { input: ' 7 ', value: 7 },
    { input: String(MAX_ATTENDEES), value: MAX_ATTENDEES },
  ])('accepts "$input"', ({ input, value }) => {
    expect(parseAttendees(input)).toEqual({ value, error: null });
  });

  it.each(['0', '-3', '2.5', 'abc', '1e3', String(MAX_ATTENDEES + 1)])(
    'rejects "%s"',
    (input) => {
      const parsed = parseAttendees(input);
      expect(parsed.value).toBeNull();
      expect(parsed.error).not.toBeNull();
    },
  );
});

describe('filterRooms', () => {
  it('returns every room when no requirements are set', () => {
    expect(filterRooms(rooms, { attendees: null, equipment: [] })).toHaveLength(3);
  });

  it('keeps rooms whose capacity equals the attendee count', () => {
    const ids = filterRooms(rooms, { attendees: 40, equipment: [] }).map((r) => r.id);
    expect(ids).toEqual(['R1', 'R2']);
  });

  it('excludes rooms whose capacity is below the attendee count', () => {
    const ids = filterRooms(rooms, { attendees: 41, equipment: [] }).map((r) => r.id);
    expect(ids).toEqual(['R1']);
  });

  it('requires every selected equipment item', () => {
    const ids = filterRooms(rooms, { attendees: null, equipment: ['Projector', 'Whiteboard'] }).map(
      (r) => r.id,
    );
    expect(ids).toEqual(['R1']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterRooms(rooms, { attendees: 200, equipment: [] })).toEqual([]);
  });

  it('keeps blocked rooms in the list because availability rules reject them', () => {
    const ids = filterRooms(rooms, { attendees: 8, equipment: ['Whiteboard'] }).map((r) => r.id);
    expect(ids).toContain('R3');
  });

  it('does not mutate the input rooms', () => {
    const snapshot = structuredClone(rooms);
    filterRooms(rooms, { attendees: 20, equipment: ['Projector'] });
    expect(rooms).toEqual(snapshot);
  });
});

describe('findMatchingRooms', () => {
  it('returns no rooms when the attendee input is invalid', () => {
    expect(findMatchingRooms(rooms, '0', [])).toEqual([]);
  });

  it('applies a valid attendee count and equipment together', () => {
    const ids = findMatchingRooms(rooms, '10', ['Projector']).map((r) => r.id);
    expect(ids).toEqual(['R1', 'R2']);
  });
});
