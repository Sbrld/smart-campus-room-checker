import { useMemo, useState } from 'react';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DoorClosed,
  MapPin,
  SearchX,
  Users,
  XCircle,
} from 'lucide-react';
import { bookings, equipmentOptions, rooms, DAY_MINUTES, MAX_BOOKING_MINUTES } from '@/data';
import type { AvailabilityResult, Room } from '@/types';
import { bookingsForRoom, checkAvailability } from '@/lib/checkAvailability';
import { toHHMM } from '@/lib/format';
import { findMatchingRooms, parseAttendees } from '@/lib/roomFilters';
import TimeField from '@/components/TimeField';
import RoomFilters from '@/components/RoomFilters';

const fromHHMM = (str: string): number | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(str);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
};

export default function App() {
  const [attendeesInput, setAttendeesInput] = useState('');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0].id);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [currentTime, setCurrentTime] = useState('09:00');
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const attendees = parseAttendees(attendeesInput);
  const matchingRooms = findMatchingRooms(rooms, attendeesInput, requiredEquipment);
  const selectedRoom: Room | null =
    matchingRooms.find((r) => r.id === selectedRoomId) ?? null;
  const hasActiveFilters = attendeesInput.trim() !== '' || requiredEquipment.length > 0;
  const activeFilterLabels = [
    attendees.value !== null ? `${attendees.value}+ attendees` : null,
    ...requiredEquipment,
  ].filter((label): label is string => label !== null);

  const roomBookings = useMemo(
    () => bookingsForRoom(bookings, selectedRoomId).sort((a, b) => a.start - b.start),
    [selectedRoomId],
  );

  const withResetResult = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setResult(null);
  };

  const applyFilters = (nextAttendeesInput: string, nextEquipment: string[]) => {
    const nextRooms = findMatchingRooms(rooms, nextAttendeesInput, nextEquipment);
    setAttendeesInput(nextAttendeesInput);
    setRequiredEquipment(nextEquipment);
    if (!nextRooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(nextRooms[0]?.id ?? '');
    }
    setResult(null);
  };

  const toggleEquipment = (item: string) => {
    const next = requiredEquipment.includes(item)
      ? requiredEquipment.filter((existing) => existing !== item)
      : [...requiredEquipment, item];
    applyFilters(attendeesInput, next);
  };

  const handleCheck = () => {
    if (!currentTime || !startTime || !endTime) {
      setResult({ available: false, reason: 'Please enter current, start, and end times.' });
      return;
    }
    const start = fromHHMM(startTime);
    const end = fromHHMM(endTime);
    const now = fromHHMM(currentTime);
    if (start === null || end === null || now === null) {
      setResult({ available: false, reason: 'Please enter current, start, and end times.' });
      return;
    }
    setResult(checkAvailability(selectedRoom, { start, end }, now, bookings));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shrink-0">
            <CalendarCheck size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Check whether a room is free for your desired time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Form card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-teal-600" />
            Check a time slot
          </h2>

          <RoomFilters
            attendeesInput={attendeesInput}
            attendeesError={attendees.error}
            equipmentOptions={equipmentOptions}
            selectedEquipment={requiredEquipment}
            hasActiveFilters={hasActiveFilters}
            onAttendeesChange={(value) => applyFilters(value, requiredEquipment)}
            onEquipmentToggle={toggleEquipment}
            onClear={() => applyFilters('', [])}
          />

          {/* Room selector */}
          <div className="mb-4">
            <label htmlFor="room" className="block text-sm font-medium mb-1.5">
              Select room
            </label>
            {attendees.error ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Fix the attendee count to see matching rooms.
              </p>
            ) : matchingRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <SearchX className="mx-auto text-slate-400" size={28} />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  No rooms match your filters
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try a smaller group or fewer equipment requirements.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-2">
                  Showing {matchingRooms.length} of {rooms.length} rooms
                  {activeFilterLabels.length > 0 && ` matching ${activeFilterLabels.join(', ')}`}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingRooms.map((room) => {
                    const active = room.id === selectedRoomId;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setResult(null);
                        }}
                        aria-pressed={active}
                        className={[
                          'text-left rounded-xl border p-3 transition-all duration-150',
                          'focus:outline-none focus:ring-2 focus:ring-teal-500/40',
                          active
                            ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500/30'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{room.name}</span>
                          {room.blocked && (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <DoorClosed size={12} /> Blocked
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {room.building}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users size={12} /> {room.capacity} seats
                          </span>
                        </div>
                        <span className="mt-1.5 block text-xs text-slate-500 leading-relaxed">
                          {room.equipment.join(' · ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TimeField
              id="currentTime"
              label="Current time"
              value={currentTime}
              onChange={withResetResult(setCurrentTime)}
            />
            <TimeField
              id="startTime"
              label="Start time"
              value={startTime}
              onChange={withResetResult(setStartTime)}
            />
            <TimeField
              id="endTime"
              label="End time"
              value={endTime}
              onChange={withResetResult(setEndTime)}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Max booking length is {MAX_BOOKING_MINUTES} minutes. Times run from 00:00 to 24:00
            ({DAY_MINUTES} minutes). The start time must be after the current time.
          </p>

          {/* Check button */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleCheck}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm px-6 py-2.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <CalendarCheck size={18} /> Check availability
            </button>
          </div>
        </section>

        {/* Result */}
        {result && (
          <section
            className={[
              'rounded-2xl border p-5 sm:p-6 transition-all',
              result.available
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              {result.available ? (
                <CheckCircle2 className="shrink-0 text-emerald-600" size={28} />
              ) : (
                <XCircle className="shrink-0 text-red-600" size={28} />
              )}
              <div className="min-w-0">
                <p
                  className={[
                    'text-lg font-semibold',
                    result.available ? 'text-emerald-800' : 'text-red-800',
                  ].join(' ')}
                >
                  {result.available ? 'Available' : 'Unavailable'}
                </p>
                <p
                  className={[
                    'text-sm mt-0.5',
                    result.available ? 'text-emerald-700' : 'text-red-700',
                  ].join(' ')}
                >
                  {result.available
                    ? `${selectedRoom?.name ?? 'This room'} is free from ${startTime} to ${endTime}. Existing bookings are unchanged.`
                    : result.reason}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Existing bookings for selected room */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
            <Building2 size={18} className="text-slate-500" />
            Existing bookings — {selectedRoom?.name ?? '—'}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            These are fictional bookings used only for the availability check.
          </p>

          {selectedRoom?.blocked && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
              <DoorClosed size={16} /> This room is blocked and cannot be booked.
            </div>
          )}

          {roomBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No existing bookings for this room.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {roomBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium tabular-nums">
                    {toHHMM(b.start)} – {toHHMM(b.end)}
                  </span>
                  <span className="text-sm text-slate-500">{b.bookedBy}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Fictional data only — this tool checks availability and does not save bookings.
        </p>
      </footer>
    </div>
  );
}
