# AGENTS.md

Instructions for AI agents working on this repository.

## Project

Smart Campus Room Availability Checker. An existing React application that checks whether a campus room is free for a requested time slot. All booking data is fictional. Continue the current application rather than generating a new one.

## Architecture

Vite + React + TypeScript + Tailwind CSS. Icons come from lucide-react. Import project modules with the `@/` alias, which maps to `src/`.

- `src/lib/checkAvailability.ts`: the booking rules. The pure function `checkAvailability(room, candidate, currentTime, existingBookings)` returns `{ available: true }` or `{ available: false, reason }`. The overlap helper `overlaps` and the room-scoping helper `bookingsForRoom(bookings, roomId)` live in the same file; the UI reuses `bookingsForRoom` for the bookings list. Keep this module free of React and UI code.
- `src/lib/roomFilters.ts`: pure filtering for attendee count and required equipment (`parseAttendees`, `filterRooms`, `findMatchingRooms`, `MAX_ATTENDEES`). Filtering is separate from availability. It must not import `checkAvailability`.
- `src/lib/format.ts`: time formatting helpers (`toHHMM`).
- `src/data.ts`: fixtures. `rooms` (each with an equipment list; one room is blocked), `equipmentOptions` (derived from the rooms), `bookings` (fictional bookings per room), and the constants `MAX_BOOKING_MINUTES` (120) and `DAY_MINUTES` (1440).
- `src/types.ts`: shared types `Room` (includes `equipment: string[]`), `Booking`, `AvailabilityResult`.
- `src/components/TimeField.tsx`: labelled time input used for the three time fields.
- `src/components/RoomFilters.tsx`: attendee count input and required-equipment checkboxes.
- `src/App.tsx`: the single-page UI. It holds the filters, room selector with empty state, time inputs, check button, result card, and existing-bookings list. Changing any filter or the selected room clears the result. It also contains the time-string parsing helper `fromHHMM`.
- `src/main.tsx`: application entry point. `src/index.css`: global styles.
- `src/lib/checkAvailability.test.ts`: unit tests for the booking rules (T01-T20).
- `src/lib/roomFilters.test.ts`: unit tests for attendee parsing and room filtering.
- `src/App.test.tsx`: UI integration tests (U1-U9) using Testing Library.
- `src/test/setup.ts`: shared test setup (jest-dom matchers).

Test stack: Vitest with jsdom.

## Acceptance Criteria

These must hold after every change.

- **AC1:** Reject invalid intervals (start not before end, or outside 0-1440) and requests whose start is not after the current time.
- **AC2:** Maximum booking duration is 120 minutes. Longer requests are rejected.
- **AC3:** Reject bookings for blocked rooms.
- **AC4:** Reject real overlaps with existing bookings in the same room. Touching endpoints (one booking ends exactly when another starts) are allowed.
- **AC5:** Do not mutate booking data. Fixture arrays and objects must never be sorted, spliced, or edited in place.
- **AC6:** Preserve clear feedback on both desktop and mobile layouts. Result messages and validation messages must stay visible and readable at small widths.

## Engineering Rules

- Prefer minimal, localized changes.
- Use pure functions for booking logic.
- Introduce at most two justified patterns. Do not add Strategy, Adapter, Singleton, or Factory without a concrete, documented need.
- Keep booking rules separate from UI concerns. `checkAvailability.ts` must not import React or UI components.
- Do not introduce new libraries unless absolutely necessary. Check `package.json` before using any package.
- Preserve existing labels, headings, and validation messages exactly as written.
- Never modify fixture arrays in place. Copy before sorting or filtering for display.
- Use the `@/` import alias for project modules.
- Do not add comments that describe the change or the task. Comments should only explain non-obvious constraints.

## Forbidden Scope Changes

- No backend, authentication, database, booking creation, or other persistence. The tool only checks availability and does not save bookings.
- No backend or database packages (for example `@supabase/supabase-js`, Prisma, Drizzle, or any ORM/SDK) may be added to `package.json` or imported anywhere in the project. The existing `@supabase/supabase-js` dependency is unused and should not be wired up.
- No secrets, API keys, tokens, or credentials in code, config, or environment files. Do not create or commit `.env` files.
- No external deployments, publishing, domain changes, or pushing to remote services. The project runs locally only.
- No unnecessary redesign of layout, colors, or copy.
- Do not rebuild the application from scratch.
- Do not weaken, skip, or delete existing tests. Do not change test expectations to make failing code pass.
- Do not start a dev server from the shell.

## Verification

Commands defined in `package.json`:

- `npm test`: runs `vitest run` (all unit and UI tests).
- `npm test -- --reporter=verbose`: same tests with per-test output.
- `npx vitest run`: same tests, direct invocation.
- `npm run build`: production build with `vite build`. Must succeed after every change to project files.
- `npm run typecheck`: TypeScript check with `tsc --noEmit`.
- `npm run lint`: ESLint across the project.
- `npm run preview`: serves the built output for manual checks. Do not run it from the shell.

Required for every change:

1. Run tests first: `npm test` must pass with all existing tests unchanged before a change is proposed as accepted. New behavior needs new tests. Confirm that AC1-AC6 still hold (not only AC1-AC5).
2. Build and typecheck: `npm run build` and `npm run typecheck` must pass. `npm run lint` must pass with no errors.
3. Desktop and mobile UI checks: confirm that the room selector, time inputs, check button, and result card remain usable and readable at desktop and narrow mobile widths. If no browser is available, state that explicitly and verify the responsive classes by reading the code.
4. Changed-file summary: list every file touched and what changed in it, in plain language, at the end of each task.

## Review Gate

- Work on a separate branch or worktree, not on the default branch.
- A human must review and approve the diff and the full test/typecheck/lint/build output before any change is accepted or merged.
- Do not merge, push, or deploy without explicit human approval. Report the real command outputs as evidence; never claim success without running the commands.
- If a command fails, fix the root cause and re-run it before reporting. Do not suppress or edit failing output to manufacture a passing result.
