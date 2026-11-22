# Smart Campus Room Availability Checker — AGENTS.md

## Purpose
This repository is a client-side React + TypeScript web application for browsing fictional campus rooms, filtering them by capacity and equipment, checking room availability against booking rules (AC1–AC6), and optionally viewing a deterministic mock explanation of the result.

## Acceptance Criteria (Must Be Preserved)
- **AC1**: Reject invalid intervals (`start < 0`, `end > 1440`, `start >= end`) and past requests (`start <= currentTime`).
- **AC2**: Maximum booking duration is 120 minutes (`end - start <= 120`).
- **AC3**: Reject blocked rooms.
- **AC4**: Reject overlapping bookings for the selected room while allowing touching endpoints (`b.end === start` or `end === b.start`).
- **AC5**: Do not mutate input room or booking arrays.
- **AC6**: Preserve clear desktop and mobile UI feedback.

## Architecture
- **Entry points**:
  - `index.html` → `src/main.tsx` → `src/App.tsx` (top-level state, room filtering, check flow, stale-result clearing, layout) and `src/index.css`.
- **Domain logic & shared utilities**:
  - `src/availability.ts`: Pure availability validation (`checkAvailability`) and stale-check comparison (`isSameCheck`).
  - `src/roomFilters.ts`: Pure room filtering (`filterRooms`) and equipment option extraction (`getEquipmentOptions`).
  - `src/constants.ts`: Shared booking limits (`MAX_BOOKING_MINUTES = 120`, `DAY_END_MINUTES = 1440`).
  - `src/time.ts`: Time formatting utility (`minutesToLabel`).
  - `src/types.ts`: Shared TypeScript interfaces (`Room`, `Booking`, `CheckInputs`, `AvailabilityResult`).
  - `src/data.ts`: Fictional fixtures (`SAMPLE_ROOMS`, `SAMPLE_BOOKINGS`).
- **Explanation module (offline mock)**:
  - `src/llm/explain.ts`: `LlmAdapter` interface and `explainSafely` wrapper (2000ms timeout, schema validation, 2-sentence limit, safe fallback).
  - `src/llm/mockAdapter.ts`: Deterministic offline `mockLlmAdapter`.
- **UI components (`src/components/`)**:
  - `RoomFilters.tsx`, `RoomGrid.tsx`, `RoomCard.tsx`, `BookingSchedule.tsx`, `TimeSelector.tsx`, `ResultBanner.tsx`, `ExplainSection.tsx`.
- **Automated tests (`src/__tests__/`)**:
  - Vitest + React Testing Library (`jsdom`) + `react-dom/server` static rendering tests.

## Setup
- **Prerequisites**: Node.js and npm installed locally.
- **Clean install**: Run `npm ci` from the repository root (uses `package-lock.json` without mutating it).
- **Local development**: Run `npm run dev` and open the Vite URL printed in the terminal.

## Safe Commands
Run these standard, non-destructive workspace commands:
```bash
npm ci              # Clean, reproducible install from package-lock.json
npm test            # Run Vitest suite once (vitest run)
npm run lint        # Run ESLint across the repository (eslint .)
npm run typecheck   # Run TypeScript type check (tsc --noEmit -p tsconfig.app.json)
npm run build       # Build production bundle to dist/ (vite build)
npm run dev         # Start local Vite dev server
npm run preview     # Preview built dist/ bundle locally
```

## Coding Conventions
- Prefer pure functions and minimal, targeted changes.
- Keep business rules strictly separate from UI components.
- Use at most two justified design patterns; do not introduce unnecessary design patterns.
- Avoid duplicated code and magic numbers (reuse `src/constants.ts` and `src/time.ts`).
- Never mutate input arrays (`rooms`, `bookings`); sort or transform shallow copies.
- Preserve existing behavior, public contracts, and desktop/mobile UI appearance.
- Maintain strict TypeScript typing (`tsconfig.app.json` has `strict: true`).
- Associate form `<label>` and `<input>` elements programmatically for accessibility and reliable testing.

## Allowed Refactoring
- Extract/reuse pure helpers (such as `minutesToLabel` in `src/time.ts` and shared domain helpers).
- Centralize booking duration and day-end constants in `src/constants.ts`.
- Replace any mutating array operations with non-mutating copies.
- Add focused regression or UI tests when justified.

## Test Expectations
- **Verified baseline**: **70 passing tests across 8 test files** (`npm test` exit code `0`):
  - `src/__tests__/time.test.ts` (2 tests)
  - `src/__tests__/roomFilters.test.ts` (10 tests)
  - `src/__tests__/availability.test.ts` (19 tests)
  - `src/__tests__/availability.regression.test.ts` (7 tests)
  - `src/__tests__/BookingSchedule.test.tsx` (1 test)
  - `src/__tests__/components.test.tsx` (5 tests)
  - `src/__tests__/App.test.tsx` (2 tests)
  - `src/__tests__/explain.test.tsx` (24 tests)
- Before accepting any code changes, execute all four verification checks and report exact results:
  ```bash
  npm test
  npm run lint
  npm run typecheck
  npm run build
  ```
- Report all failures and remaining limitations honestly. Never claim that an unexecuted test or check passed.
- Add focused regression tests for bug fixes or behavioral edge cases without removing, skipping, or weakening existing tests.
- When UI behavior changes, verify desktop and mobile widths in addition to automated tests.

## Forbidden Actions
- **No secrets**: Never access, hardcode, log, expose, or commit secrets, API keys, tokens, or credentials.
- **No production deployment**: Never deploy to, modify, or connect to production systems or external services.
- **No destructive commands**: Never run destructive git or filesystem commands (e.g., `git reset --hard`, `git checkout -- .`, `git clean -fd`, `git push --force`, or recursive deletion of tracked/project files).
- **No unreviewed dependency changes**: Never add, remove, or upgrade packages in `package.json` or `package-lock.json` without explicit human review and approval.
- **No fixture changes**: Never modify sample room/booking fixtures in `src/data.ts` without explicit human approval.
- **No weakening of assertions**: Never delete, skip (`.skip`), comment out, or loosen existing tests or assertions to make a suite pass.
- **No out-of-scope features**: Do not introduce a backend or database, authentication/login, booking creation/persistence, UI redesign, or changes to AC1–AC6.

## AI Agent Workflow & Human Approval
- Read this file explicitly before modifying source code; do not assume it was loaded automatically.
- Summarize applicable constraints and explain planned changes before editing source files.
- Wait for human approval before applying source code changes, merging, or deploying.
- Review changed files and diffs after edits, record exact verification command outputs, and state any remaining risks or limitations.
