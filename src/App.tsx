import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  CalendarClock,
  Lock,
  Building2,
  Info,
} from 'lucide-react';
import { sampleRooms } from '@/sampleData';
import { checkAvailability, fmt, MAX_BOOKING_LENGTH, MINUTES_PER_DAY } from '@/availability';
import type { CheckResult } from '@/types';

function timeToMinutes(t: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  const [h, m] = t.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  return fmt(min);
}

export default function App() {
  const [rooms] = useState(sampleRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(sampleRooms[0].id);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [currentTimeStr, setCurrentTimeStr] = useState('09:00');
  const [result, setResult] = useState<CheckResult | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId],
  );

  const currentMinutes = timeToMinutes(currentTimeStr) ?? 0;

  function handleCheck() {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (start === null || end === null) {
      setResult({ available: false, reason: 'Please enter valid times in HH:MM format.' });
      return;
    }
    setResult(checkAvailability(selectedRoom, start, end, currentMinutes));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-700 to-sky-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Smart Campus Room Availability Checker
              </h1>
              <p className="mt-0.5 text-sm text-sky-100/80">
                Check if a campus room is free for your desired time slot.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Info className="h-5 w-5 text-sky-600" />
              Booking Check
            </h2>

            {/* Room selection */}
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Select Room
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {rooms.map((room) => {
                  const active = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          active ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                        }`}
                      >
                        {active && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {room.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {room.building}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {room.capacity}
                          </span>
                          {room.blocked && (
                            <span className="flex items-center gap-1 font-medium text-amber-600">
                              <Lock className="h-3 w-3" /> Blocked
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time inputs */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" /> Current Time
                </label>
                <input
                  type="time"
                  value={currentTimeStr}
                  onChange={(e) => {
                    setCurrentTimeStr(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="mt-1 text-xs text-slate-400">{fmt(currentMinutes)} — reference</p>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" /> Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="mt-1 text-xs text-slate-400">{fmt(timeToMinutes(startTime) ?? 0)}</p>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" /> End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="mt-1 text-xs text-slate-400">{fmt(timeToMinutes(endTime) ?? 0)}</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Rules: max {MAX_BOOKING_LENGTH} min per booking · start must be after current time ·
              within 00:00–24:00 · no overlap with existing bookings.
            </div>

            {/* Check button */}
            <button
              onClick={handleCheck}
              className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:bg-sky-800"
            >
              Check Availability
            </button>

            {/* Result */}
            {result && (
              <div
                className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${
                  result.available
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                {result.available ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      result.available ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {result.available ? 'Available' : 'Unavailable'}
                  </p>
                  <p
                    className={`mt-0.5 text-sm ${
                      result.available ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {result.reason}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Room details card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedRoom.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> {selectedRoom.building}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {selectedRoom.capacity} seats
                  </span>
                </div>
              </div>
              {selectedRoom.blocked && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <Lock className="h-3.5 w-3.5" /> {selectedRoom.blockedReason}
                </span>
              )}
            </div>

            {/* Timeline visualization */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>00:00</span>
                <span className="font-medium text-slate-600">Today's Schedule</span>
                <span>24:00</span>
              </div>

              {/* Timeline bar */}
              <div className="relative h-10 overflow-hidden rounded-lg bg-slate-100">
                {/* Hour gridlines */}
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-slate-200"
                    style={{ left: `${(i / 24) * 100}%` }}
                  />
                ))}

                {/* Existing bookings */}
                {selectedRoom.bookings.map((b) => {
                  const blockWidth = ((b.end - b.start) / MINUTES_PER_DAY) * 100;
                  const showLabel = blockWidth > 8;
                  return (
                    <div
                      key={b.id}
                      className={`absolute top-0 flex h-full items-center justify-center overflow-hidden border-r border-sky-300 bg-sky-200/70 ${
                        showLabel ? 'px-1' : ''
                      }`}
                      style={{
                        left: `${(b.start / MINUTES_PER_DAY) * 100}%`,
                        width: `${blockWidth}%`,
                      }}
                      title={`${b.title} (${fmt(b.start)}–${fmt(b.end)})`}
                    >
                      {showLabel && (
                        <span className="truncate text-[10px] font-medium text-sky-800">
                          {fmt(b.start)}–{fmt(b.end)}
                        </span>
                      )}
                      {!showLabel && (
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                      )}
                    </div>
                  );
                })}

                {/* Blocked overlay */}
                {selectedRoom.blocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-100/80">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                      <Lock className="h-3.5 w-3.5" /> Room Blocked
                    </span>
                  </div>
                )}

                {/* Candidate interval preview */}
                {(() => {
                  const s = timeToMinutes(startTime);
                  const e = timeToMinutes(endTime);
                  if (s === null || e === null || s >= e) return null;
                  return (
                    <div
                      className={`absolute bottom-0 h-1.5 ${
                        result?.available ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      style={{
                        left: `${(s / MINUTES_PER_DAY) * 100}%`,
                        width: `${((e - s) / MINUTES_PER_DAY) * 100}%`,
                      }}
                    />
                  );
                })()}
              </div>

              {/* Current time marker */}
              <div className="relative mt-1">
                <div
                  className="absolute flex flex-col items-center"
                  style={{ left: `${(currentMinutes / MINUTES_PER_DAY) * 100}%` }}
                >
                  <div className="h-2 w-px bg-rose-400" />
                  <span className="mt-0.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-rose-500">
                    Now {fmt(currentMinutes)}
                  </span>
                </div>
                <div className="h-5" />
              </div>

              {/* Legend */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-4 rounded-sm bg-sky-200/70 border-r border-sky-300" />
                  Existing booking
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Booking too short to label — hover for details
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-4 rounded-full bg-slate-400" />
                  Your selected interval
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-px bg-rose-400" />
                  Current time
                </span>
              </div>
            </div>

            {/* Booking list */}
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Existing Bookings ({selectedRoom.bookings.length})
              </h3>
              {selectedRoom.bookings.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-400">
                  No existing bookings for this room.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedRoom.bookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">{b.title}</p>
                        <p className="text-xs text-slate-400">by {b.bookedBy}</p>
                      </div>
                      <span className="ml-3 flex-shrink-0 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">
                        {fmt(b.start)}–{fmt(b.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Prototype only — checks availability and does not save or confirm any booking. Uses fictional sample data.
        </p>
      </main>
    </div>
  );
}
