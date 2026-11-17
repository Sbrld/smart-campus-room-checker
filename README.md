# Smart Campus Room Availability Checker

**Student:** Sabyrov Rustem
**Student ID:** 24B031981
**Course:** Software Engineering, Assignment #04

## 1. Project Overview

The Smart Campus Room Availability Checker is a single-page web application that tells a user whether a campus room is free for a requested time slot. A user chooses a room, enters the current time and a start and end time, and the application applies the booking rules and shows either "Available" or "Unavailable" with a reason.

The project is built with:

- React and TypeScript for the user interface
- Vite as the build tool and development server
- Tailwind CSS for styling
- lucide-react for icons
- Vitest with jsdom and Testing Library for automated tests

All rooms and bookings are fictional and stored in code. The application has no backend, no database, and no authentication. It checks availability only and does not save bookings.

## 2. Features

- Five fictional campus rooms, each with a capacity, equipment list, and building.
- Room selection and booking availability checks for a chosen time slot.
- **F1, Capacity filtering:** enter the number of attendees to show only rooms with enough capacity. A room whose capacity equals the attendee count is shown.
- **F2, Equipment filtering:** select one or more required equipment items. Only rooms that have every selected item are shown.
- **F3, Blocked room handling:** blocked rooms can appear in the list but are never reported as available.
- **F4, Empty-state feedback:** when no room matches the filters, a clear message is shown instead of an empty list.
- **F5, Result reset:** the availability result is cleared when the selected room or any filter changes, so a stale result is never shown.
- Responsive layout built with Tailwind CSS breakpoints. The mobile layout has not yet been checked by hand (see Known Limitations).

## 3. Project Structure

```
.
├── index.html                       Browser entry HTML
├── package.json                     Scripts and dependencies
├── vite.config.ts                   Vite configuration
├── tailwind.config.js               Tailwind CSS configuration
├── eslint.config.js                 ESLint configuration
├── tsconfig*.json                   TypeScript configuration
├── AGENTS.md                        Instructions and rules for the project
└── src/
    ├── main.tsx                     Application entry point
    ├── App.tsx                      Single-page UI: filters, room selector, time inputs,
    │                                check button, result card, existing bookings list
    ├── App.test.tsx                 UI integration tests (U1 to U9) using Testing Library
    ├── data.ts                      Fictional rooms, equipment options, bookings,
    │                                and constants (120-minute limit, 1440-minute day)
    ├── types.ts                     Shared types: Room, Booking, AvailabilityResult
    ├── index.css                    Global styles
    ├── vite-env.d.ts                Vite type declarations
    ├── components/
    │   ├── TimeField.tsx            Labelled time input used for current, start, and end times
    │   └── RoomFilters.tsx          Attendee count input and required-equipment checkboxes
    ├── lib/
    │   ├── checkAvailability.ts     Pure booking rules (AC1 to AC5) and bookingsForRoom helper
    │   ├── checkAvailability.test.ts Unit tests for the booking rules (T01 to T20)
    │   ├── roomFilters.ts           Pure attendee parsing and room filtering (F1, F2)
    │   ├── roomFilters.test.ts      Unit tests for attendee parsing and room filtering
    │   └── format.ts                Time formatting helper (toHHMM)
    └── test/
        └── setup.ts                 Shared test setup (jest-dom matchers)
```

Design note: filtering (`roomFilters.ts`) is kept separate from availability (`checkAvailability.ts`). A room can match the filters and still be reported as unavailable. `checkAvailability.ts` does not import React or UI code.

## 4. Installation

Install the project dependencies from the project root:

```bash
npm install
```

## 5. Development

Start the Vite development server:

```bash
npm run dev
```

Then open the local address that Vite prints in the terminal.

## 6. Testing

Run the full automated test suite once:

```bash
npm test
```

Run the same tests with one line of output per test:

```bash
npm test -- --reporter=verbose
```

Check TypeScript types without producing output files:

```bash
npm run typecheck
```

Run ESLint across the project:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## 7. Acceptance Criteria

The booking rules and feature requirements are defined in `AGENTS.md`.

- **AC1, Valid intervals:** the start must be before the end, both must be within 0 to 1440 minutes, and the start must be after the current time.
- **AC2, Maximum duration:** a booking may last at most 120 minutes. A 120-minute booking is allowed; 121 minutes is rejected.
- **AC3, Blocked rooms:** bookings for blocked rooms are rejected.
- **AC4, No overlaps:** a request that really overlaps an existing booking in the same room is rejected. Touching endpoints (one booking ends exactly when another starts) are allowed.
- **AC5, No data mutation:** booking and room data are never sorted, spliced, or edited in place.
- **AC6, Readable feedback:** result and validation messages must stay visible and readable on desktop and mobile widths. This has not yet been checked by hand on a mobile layout.
- **F1 to F5:** described in Section 2, Features.

## 8. Verification Results

- **Baseline:** 20 of 20 tests passed across 2 test files, at the start of Assignment #04.
- **Final:** 49 of 49 tests passed across 3 test files (`npm test -- --reporter=verbose`).
- **Typecheck (`npm run typecheck`):** passed with no errors.
- **Lint (`npm run lint`):** passed with no errors.
- **Build (`npm run build`):** succeeded. The build prints a notice that the Browserslist and caniuse-lite data is outdated; this does not stop the build.

## 9. Known Limitations

- **Fictional data only:** rooms and bookings are defined in `src/data.ts`. Real campus data is not connected.
- **No booking persistence:** the tool checks availability only. Bookings are not saved, and changes are lost on reload.
- **No real-world performance or accessibility audit:** no performance measurement or formal accessibility audit has been carried out.
- **Mobile layout not manually verified:** the responsive classes are in place, but the layout has not been checked by hand at narrow widths.
- **Time parsing:** time input handling could be stricter.
- **Dependency warnings:** the outdated Browserslist data notice remains in the build output.
