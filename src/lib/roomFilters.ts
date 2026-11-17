import type { Room } from '@/types';

export const MAX_ATTENDEES = 1000;

export interface AttendeeParseResult {
  value: number | null;
  error: string | null;
}

export function parseAttendees(input: string): AttendeeParseResult {
  const trimmed = input.trim();
  if (trimmed === '') return { value: null, error: null };
  const count = Number(trimmed);
  if (!/^\d+$/.test(trimmed) || count < 1 || count > MAX_ATTENDEES) {
    return {
      value: null,
      error: `Enter a whole number of attendees from 1 to ${MAX_ATTENDEES}.`,
    };
  }
  return { value: count, error: null };
}

export function filterRooms(
  rooms: Room[],
  requirements: { attendees: number | null; equipment: string[] },
): Room[] {
  return rooms.filter(
    (room) =>
      (requirements.attendees === null || room.capacity >= requirements.attendees) &&
      requirements.equipment.every((item) => room.equipment.includes(item)),
  );
}

export function findMatchingRooms(
  rooms: Room[],
  attendeesInput: string,
  equipment: string[],
): Room[] {
  const attendees = parseAttendees(attendeesInput);
  if (attendees.error) return [];
  return filterRooms(rooms, { attendees: attendees.value, equipment });
}
