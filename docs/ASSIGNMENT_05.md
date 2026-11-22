# Software Engineering — Assignment #05 Report
**Project:** Smart Campus Room Availability Checker  
**Scope:** Baseline verification, repository audit, maintainability & pattern evaluation, risk register, targeted mitigations (`R-01`, `R-02`), agent-readiness audit, hypothetical background-agent task design, and release decision.

---

## Executive Summary
- **Baseline checks:** `npm ci`, `npm test` (70/70 tests across 8 files), `npm run lint`, `npm run typecheck`, and `npm run build` all exited with code `0` (`evidence05/baseline-*.txt`). `npm audit` exited with code `1`, reporting 25 dependency advisories (`evidence05/dependency-audit.txt`).
- **Pattern decision:** **No design pattern is warranted** (Strategy and Adapter were evaluated and rejected for the `App.tsx`/`availability.ts` maintainability issue); no refactoring was implemented and `R-03` is deferred.
- **Mitigations executed:** Top two confirmed risks — **R-01** (multi-reason explanation fallback) and **R-02** (unassociated `TimeSelector` labels) — were verified with failing regression tests (`evidence05/regressions-before.txt`), fixed via minimal approved diffs (`evidence05/R01.diff`, `evidence05/R02.diff`), and re-verified with **72/72 passing tests across 9 files**, clean lint, clean typecheck, and clean production build (`evidence05/final-*.txt`).
- **Agent-readiness level:** **Level 2 — Documented**.
- **Release decision:** **CONDITIONAL**.

---

## 1. Repository Map

### Entry Points
- `index.html` — HTML shell mounting `#root` and loading `/src/main.tsx`.
- `src/main.tsx` — React `StrictMode` root mounting `App` and importing `src/index.css`.
- `src/App.tsx` — Top-level UI state, room filtering, availability check flow, stale-result guard, and layout.

### Core Domain & Utility Modules
- `src/availability.ts` — Pure booking validation (`checkAvailability`) and stale-check comparison (`isSameCheck`).
- `src/roomFilters.ts` — Pure room filtering (`filterRooms`) and equipment option extraction (`getEquipmentOptions`).
- `src/constants.ts` — Shared limits: `MAX_BOOKING_MINUTES = 120`, `DAY_END_MINUTES = 1440`.
- `src/time.ts` — Time label formatting (`minutesToLabel`).
- `src/data.ts` — Fictional local fixtures: `SAMPLE_ROOMS` (5 rooms), `SAMPLE_BOOKINGS` (6 bookings).
- `src/types.ts` — Shared TypeScript interfaces (`Room`, `Booking`, `CheckInputs`, `AvailabilityResult`).
- `src/llm/explain.ts` — `LlmAdapter` interface and `explainSafely` wrapper (2000ms timeout, schema check, 2-sentence limit, safe fallback).
- `src/llm/mockAdapter.ts` — Deterministic offline `mockLlmAdapter`.

### UI Components (`src/components/`)
- `RoomFilters.tsx` — Minimum capacity input, equipment toggle buttons, clear-filters button.
- `RoomGrid.tsx` & `RoomCard.tsx` — Matching room cards, open/blocked badges, empty-filter state.
- `BookingSchedule.tsx` — Non-mutating sorted booking schedule for the selected room.
- `TimeSelector.tsx` — Numeric minute input (`0–1440`) with `HH:MM` preview.
- `ResultBanner.tsx` — Availability decision banner and reasons list.
- `ExplainSection.tsx` — On-demand mock explanation button, loading/done/fallback phases, and request-sequence guard.

### Dependencies (`package.json`)
- **Runtime:** `react` (`^18.3.1`), `react-dom` (`^18.3.1`), `lucide-react` (`^0.446.0`), `@supabase/supabase-js` (`^2.57.4` — unused in `src/` and absent from `dist/assets/*`).
- **Dev / Build / Test:** `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `jsdom`, `@testing-library/react`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`.

### Test Suite (`src/__tests__/`)
- Baseline: **8 files, 70 tests**:
  - `time.test.ts` (2), `roomFilters.test.ts` (10), `availability.test.ts` (19), `availability.regression.test.ts` (7), `BookingSchedule.test.tsx` (1), `components.test.tsx` (5), `App.test.tsx` (2), `explain.test.tsx` (24).
- Post-mitigation addition: `riskRegressions.test.tsx` (2 tests for `R-01` and `R-02`) → **9 files, 72 tests**.

### Build & Verification Scripts (`package.json`)
- `dev`: `vite`
- `build`: `vite build`
- `preview`: `vite preview`
- `test`: `vitest run`
- `lint`: `eslint .`
- `typecheck`: `tsc --noEmit -p tsconfig.app.json`

---

## 2. Acceptance Criteria That Must Remain True

1. **Core Availability Rules (AC1–AC4):** `checkAvailability` accepts only when a non-blocked room is selected, `0 <= start < end <= 1440`, `start > currentTime`, `end - start <= 120`, and no booking for that room overlaps (`b.start < end && start < b.end`), while permitting touching endpoints and ignoring other rooms' bookings.
2. **Data Immutability (AC5):** Availability checks, room filtering, and `BookingSchedule` rendering never mutate input `bookings` or `rooms` arrays.
3. **Filtering & Stale-Result Integrity:** `filterRooms` enforces inclusive minimum capacity (`>=`) and all-required-equipment (`AND`) semantics, displays an empty state when no rooms match, and clears both the verdict banner and explanation when room or time inputs change.
4. **Safe Explanation Contract:** `explainSafely` never throws, clears timeout timers on settlement, enforces output shape and the 2-sentence limit, and falls back to `EXPLAIN_FALLBACK_TEXT` on timeout, rejection, or malformed responses.
5. **Quality Gates & UI Preservation (AC6):** `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` exit `0`, and clear desktop/mobile UI feedback is preserved without adding forbidden scope (no backend/database, auth, booking persistence, or UI redesign).

---

## 3. Baseline Results

All five baseline commands plus `npm audit` were executed prior to any code changes:

| Command | Exit Code | Observed Result | Evidence File |
| --- | :---: | --- | --- |
| `npm ci` | `0` | Added 387 packages; reported 25 vulnerabilities (2 low, 7 moderate, 14 high, 2 critical) and deprecated `whatwg-encoding@3.1.1`. | `evidence05/baseline-ci.txt` |
| `npm test` | `0` | 8 test files passed (8); 70 tests passed (70). | `evidence05/baseline-test.txt` |
| `npm run lint` | `0` | `eslint .` exited cleanly with 0 errors and 0 warnings. | `evidence05/baseline-lint.txt` |
| `npm run typecheck` | `0` | `tsc --noEmit -p tsconfig.app.json` exited cleanly with 0 errors. | `evidence05/baseline-typecheck.txt` |
| `npm run build` | `0` | Built `dist/` in 1.86s (`index.html` 0.71 kB, CSS 13.59 kB, JS 160.72 kB); `caniuse-lite` outdated warning. | `evidence05/baseline-build.txt` |
| `npm audit` | `1` | 25 vulnerabilities (2 low, 7 moderate, 14 high, 2 critical); fixing `vitest`/`tinypool` requires breaking upgrade to `vitest@5.1.1`. | `evidence05/dependency-audit.txt` |

---

## 4. Concrete Weaknesses & Missing Checks (Facts vs. Assumptions)

1. **Unassociated `<label>` in `TimeSelector` and wrong-input UI tests (`R-02`):**
   - *Observed facts:* `src/components/TimeSelector.tsx` (lines 17–26) rendered `<label>` and `<input type="number">` without `htmlFor`/`id`. Because `RoomFilters.tsx` renders `<input id="min-capacity" type="number">` first, `getAllByRole('spinbutton')[1]` in `src/__tests__/App.test.tsx` (lines 47–52) and `src/__tests__/explain.test.tsx` (lines 270–291) actually mutates **Current Time** instead of **Start Time**, leaving invalid-interval UI explanation untested.
   - *Assumption:* Wiring `htmlFor`/`id` and migrating queries to `getByLabelText` restores accessibility and eliminates brittle index drift.
2. **Multi-reason rejections fail the 2-sentence validator (`R-01`):**
   - *Observed facts:* `src/availability.ts` (lines 23–56) pushes multiple period-terminated reasons; `src/llm/mockAdapter.ts` (lines 24–28) joined them with spaces, producing 3+ sentences; `src/llm/explain.ts` (lines 22–59) replaces any response with `> 2` sentences with `EXPLAIN_FALLBACK_TEXT`. No baseline test passed `reasons.length >= 2` to `explainSafely`.
   - *Assumption:* Any user triggering 2+ rules simultaneously would see `"Explanation temporarily unavailable."` instead of the rejection reasons (subsequently confirmed by failing regression test `R-01`).
3. **Mixed UI/business logic in `App.tsx` and duplicated time formatting (`R-03`):**
   - *Observed facts:* `src/App.tsx` (lines 69, 130–143) duplicates duration/ordering conditionals in JSX without checking `start < 0` or `end > DAY_END_MINUTES`. `src/llm/mockAdapter.ts` (lines 3–7) duplicates `minutesToLabel` (`src/time.ts`, lines 1–5) as `formatTime`, and neither guards negative or `NaN` values.
   - *Assumption:* Out-of-range inputs (`start = -10, end = 50` or `1400..1460`) display a misleading neutral duration hint and malformed time labels.
4. **Contradictory JSDoc, stale `README.md`, and permissive `typecheck` config (`R-05`):**
   - *Observed facts:* `src/availability.ts` line 7 JSDoc says `start ≥ currentTime`, whereas line 29 and test T02 enforce strict `start > currentTime`. `README.md` (lines 32–45) still states 44 tests across 6 files and omits `src/llm/` and `ExplainSection`. `tsconfig.app.json` (lines 25–26) sets `noUnusedLocals: false` and `noUnusedParameters: false`, and `npm run typecheck` excludes `tsconfig.node.json`.
   - *Assumption:* An autonomous agent reading docs/comments without checking tests could invert AC1 or overlook `src/llm/`.
5. **Unused dependency, audit advisories, and untested UI/layout paths (`R-04`, `R-06`):**
   - *Observed facts:* `@supabase/supabase-js` is declared in `package.json` and pulls in `ws@8.18.3` (`npm ls ws`), yet 0 files in `src/` and `dist/assets/*` reference `supabase` or `realtime-js`. `npm audit` reports 25 advisories. No automated tests cover `ExplainSection` retry/fallback/race UI states, interactive filter-deselection (`activeRoomId`), or browser desktop/mobile layouts (`README.md` line 57). No `.github/` CI directory exists (`Test-Path .github` = `False`).
   - *Assumption:* Most advisories are confined to dev/build/test tooling rather than runtime browser code; no exploitability in this app has been established.

---

## 5. Maintainability Problem & Design Pattern Decision

- **Identified maintainability problem (`R-03`):** Mixed UI/business logic and duplicated interval/duration conditionals in `src/App.tsx` (lines 69, 130–143) compared with `src/availability.ts` (lines 26–36). `App.tsx` re-implements `duration <= 0` and `duration > MAX_BOOKING_MINUTES` inline inside JSX while omitting AC1 day bounds (`0..1440`), causing UI hints to diverge from `checkAvailability` and requiring lockstep edits across UI and domain files.
- **Strategy evaluation — Rejected:** Strategy is justified only when interchangeable algorithms/policies must be swapped at runtime. AC1–AC4 are a single fixed rule set explicitly frozen in `AGENTS.md`. Wrapping simple numeric checks in Strategy objects would add indirection and violate `AGENTS.md` (*"Prefer pure functions and minimal changes"*, *"Do not introduce unnecessary design patterns"*).
- **Adapter evaluation — Rejected:** Adapter bridges an incompatible external or legacy interface. `App.tsx` and `availability.ts` are internal TypeScript modules sharing `src/types.ts` and `src/constants.ts`; no external interface mismatch exists here. (The codebase already uses a lightweight `LlmAdapter` interface in `src/llm/explain.ts` where an async/test-double boundary actually exists.)
- **Pattern decision:** **No design pattern is warranted.** No refactoring was implemented in this session, and **`R-03` is deferred**. If addressed in a future approved change, a small pure helper function in `src/availability.ts` (plus reusing `minutesToLabel` in `src/llm/mockAdapter.ts`) is preferable to introducing any design pattern.

---

## 6. Risk Register

*Prioritization note among confirmed risks: **R-01** (`6`) ranks #1. **R-02** (`4`) and **R-03** (`4`) are tied by initial score; **R-02 outranks the tied R-03 because it has a reproducible failing test** (`evidence05/regressions-before.txt`).*

| ID | Category | Cause/Event/Consequence | Component | Evidence | Likelihood | Impact | Score | Classification | Mitigation | Owner | Verification | Residual risk |
| --- | --- | --- | --- | --- | :---: | :---: | :---: | --- | --- | --- | --- | --- |
| **R-01** | Reliability | **Cause:** `checkAvailability` emits multiple period-terminated reasons; `mockLlmAdapter` joined them with spaces; `explainSafely` rejects `> 2` sentences.<br>**Event:** User triggers 2+ rules and clicks *Explain availability*.<br>**Consequence:** UI silently falls back to `"Explanation temporarily unavailable."`. | `src/llm/mockAdapter.ts`, `src/llm/explain.ts`, `ExplainSection` | `src/availability.ts:23-56`, `src/llm/mockAdapter.ts:24-28`, `src/llm/explain.ts:22-59`, `evidence05/regressions-before.txt` | 3 | 2 | **6** | `confirmed` | Strip trailing `[.!?]+` from each reason and join with `"; "` plus one trailing `"."` in `mockLlmAdapter` (`evidence05/R01.diff`). | App Maintainer | Regression test `R-01` failed pre-fix (`regressions-before.txt`) and passes post-fix (`final-test.txt`: 72/72); `lint`, `typecheck`, `build` exit `0`. | **1 (`1×1`) — Low:** Multi-reason responses from `checkAvailability` stay within 2 sentences. Only hypothetical custom reasons with internal `.`/`!`/`?` could still split. |
| **R-02** | Correctness | **Cause:** `TimeSelector` rendered `<label>` and `<input>` without `htmlFor`/`id`; `RoomFilters` renders an earlier spinbutton.<br>**Event:** Assistive tech uses labels or UI tests index `spinbutton[1]`.<br>**Consequence:** Broken label association; existing UI tests mutate Current Time instead of Start Time and leave invalid-interval UI flow untested. | `src/components/TimeSelector.tsx`, `src/__tests__/App.test.tsx`, `src/__tests__/explain.test.tsx` | `src/components/TimeSelector.tsx:17-26`, `src/components/RoomFilters.tsx:29-36`, `src/__tests__/App.test.tsx:47-52`, `src/__tests__/explain.test.tsx:270-291`, `evidence05/regressions-before.txt` | 2 | 2 | **4** | `confirmed` | Wire `<label htmlFor={inputId}>` to `<input id={inputId}>` using React `useId()` (`evidence05/R02.diff`). | App Maintainer | Regression test `R-02` failed pre-fix (`regressions-before.txt`) and passes post-fix via `getByLabelText` (`final-test.txt`: 72/72); `lint`, `typecheck`, `build` exit `0`. | **2 (`1×2`) — Open partial residual:** Label association in `TimeSelector` is fixed and verified by `R-02`, **but existing tests in `App.test.tsx` and `explain.test.tsx` still index `spinbutton[1]` and still change Current Time** because existing assertions must not be modified; this remains an open residual risk. |
| **R-03** | Maintainability | **Cause:** `App.tsx` duplicates duration/ordering checks inline without `0..1440` bounds; `mockAdapter.ts` duplicates `minutesToLabel` as `formatTime`.<br>**Event:** Out-of-range inputs (`< 0` or `> 1440`) or one-sided rule edits.<br>**Consequence:** Misleading duration hint contradicting AC1; duplicated formatting code. | `src/App.tsx`, `src/availability.ts`, `src/llm/mockAdapter.ts`, `src/time.ts` | `src/App.tsx:69`, `src/App.tsx:130-143`, `src/llm/mockAdapter.ts:3-7`, `src/time.ts:1-5` | 2 | 2 | **4** | `confirmed` | Deferred (ranked #3 behind R-02): extract pure interval-summary helper in `availability.ts` and reuse `minutesToLabel` in `mockAdapter.ts`. | App Maintainer | Not executed (deferred). | **4 (`2×2`) — Unchanged (deferred).** |
| **R-04** | Dependency | **Cause:** Locked dev/build/test packages (`vitest`/`tinypool`, `vite`/`esbuild`/`rollup`, `postcss`, etc.) have advisories; unused `@supabase/supabase-js` pulls `ws@8.18.3`.<br>**Event:** `npm audit` reports 25 advisories (2 critical, 14 high, 7 moderate, 2 low).<br>**Consequence:** Tooling runs with published advisories and unused runtime dependency surface (no runtime exploitability verified; `supabase`/`realtime-js` absent from `src/` and `dist/assets/*`). | `package.json`, `package-lock.json` | `evidence05/dependency-audit.txt`, `package.json:14-38`, `npm ls ws` | 1 | 3 | **3** | `confirmed` | Deferred (dependency changes require separate human approval): remove unused `@supabase/supabase-js` and upgrade audited dev tooling. | Repo Maintainer | Not executed (dependency changes prohibited in this step). | **3 (`1×3`) — Unchanged (deferred).** |
| **R-05** | Agent Operations | **Cause:** `availability.ts` JSDoc says `start ≥ currentTime` while code/T02 enforce `start > currentTime`; `README.md` cites 44 tests across 6 files and omits `src/llm/`; `tsconfig.app.json` disables unused-variable checks and `typecheck` skips `tsconfig.node.json`.<br>**Event:** An agent relies on stale docs/comments or introduces unused bindings / broken Node config types.<br>**Consequence:** Risk of AC1 boundary inversion or undetected dead code / config errors. | `src/availability.ts`, `README.md`, `tsconfig.app.json`, `package.json` | `src/availability.ts:7` vs. `:29`, `README.md:32-45`, `tsconfig.app.json:25-26`, `package.json:11` | 1 | 2 | **2** | `plausible/unverified` | Sync JSDoc and `README.md` with actual code/tests; consider checking `tsconfig.node.json` in `typecheck`. | App Maintainer | Not executed. | **2 (`1×2`) — Unchanged (T02 currently guards AC1).** |
| **R-06** | Reliability | **Cause:** Automated tests do not cover `ExplainSection` fallback/retry/out-of-order response UI states, interactive filter-deselection (`activeRoomId`), or browser desktop/mobile viewport layouts (AC6).<br>**Event:** UI changes alter responsive classes or async/filter state logic.<br>**Consequence:** Regressions in retry/fallback UI or mobile layout could pass automated tests undetected. | `src/App.tsx`, `src/components/ExplainSection.tsx`, `src/components/RoomFilters.tsx`, `src/__tests__/` | `src/components/ExplainSection.tsx:30-83`, `src/App.tsx:33-52`, `README.md:57` | 2 | 2 | **4** | `plausible/unverified` | Add targeted `jsdom` tests for `ExplainSection` UI states and filter-deselection; perform manual desktop/mobile layout checks on UI changes. | App Maintainer | Not executed (desktop/mobile browser inspection not executed in this session). | **4 (`2×2`) — Unchanged.** |
| **R-07** | Security | **Cause (challenged):** Hypothesized DOM XSS from rendered explanations/inputs or leaked LLM/Supabase API keys.<br>**Event (challenged):** Script injection via UI text or credential extraction from `dist/`.<br>**Consequence (challenged):** Browser script execution or unauthorized API access. | `ExplainSection`, `ResultBanner`, `mockAdapter.ts`, `dist/assets/*` | `Select-String` sink scan (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, `fetch`, etc.): 0 matches in `src/`; `supabase\|realtime-js`: 0 matches in `src/` and `dist/assets/*` | 1 | 1 | **1** | `unsupported` | No mitigation needed; claim refuted by code and bundle evidence (React JSX escaping, offline mock adapter, zero network calls/secrets). | N/A | Verified via static regex scans on `src/` and `dist/assets/*`. | **1 (`1×1`) — Unsupported / not applicable.** |

---

## 7. Mitigation Records

### Mitigation Record — R-01 (Multi-Reason Explanation Fallback)
- **Baseline evidence:**
  - `src/availability.ts:23-56` returns multiple period-terminated reasons; `src/llm/mockAdapter.ts:24-28` joined them with spaces into 3+ sentences; `src/llm/explain.ts:22-59` rejected outputs with `> 2` sentences.
  - Pre-fix regression test `R-01` in `src/__tests__/riskRegressions.test.tsx` failed on unmodified code: `expected 'Explanation temporarily unavailable.' not to be 'Explanation temporarily unavailable.'` (`npm test` exit code `1`: 2 failed, 70 passed — `evidence05/regressions-before.txt`).
- **Patch (`evidence05/R01.diff`):**
  - Modified `src/llm/mockAdapter.ts` (`+5/-1` lines): strips trailing `[.!?]+` from each reason, joins non-empty reasons with `"; "`, and appends a single `"."`, keeping multi-reason responses within 2 sentences while preserving single-reason output verbatim.
- **Final evidence:**
  - `evidence05/final-test.txt`: exit code `0` — **9 test files passed (9), 72 tests passed (72)** (including `R-01` and all 24 existing tests in `explain.test.tsx`).
  - `evidence05/final-lint.txt`: exit code `0` (0 errors, 0 warnings).
  - `evidence05/final-typecheck.txt`: exit code `0` (0 errors).
  - `evidence05/final-build.txt`: exit code `0` (built `dist/` in 1.98s).
- **Residual risk:**
  - Reduced from **6 (`3×2`)** to **1 (`1×1`)**. All multi-reason outputs generated by `checkAvailability` now satisfy the 2-sentence contract; only a hypothetical future reason containing internal `.`, `!`, or `?` characters could still split into > 2 sentences.

### Mitigation Record — R-02 (Unassociated `TimeSelector` Labels)
- **Baseline evidence:**
  - `src/components/TimeSelector.tsx:17-26` rendered `<label>` and `<input type="number">` without `htmlFor`/`id`, breaking programmatic label association and contributing to brittle `spinbutton[1]` indexing in `App.test.tsx` and `explain.test.tsx`.
  - Pre-fix regression test `R-02` in `src/__tests__/riskRegressions.test.tsx` failed on unmodified code with `TestingLibraryElementError: Found a label with the text of: /Current Time/i, however no form control was found associated to that label` (`npm test` exit code `1`: 2 failed, 70 passed — `evidence05/regressions-before.txt`).
- **Patch (`evidence05/R02.diff`):**
  - Modified `src/components/TimeSelector.tsx` (`+7/-1` lines): uses React `useId()` to bind `<label htmlFor={inputId}>` to `<input id={inputId}>` with zero visual or behavioral regression.
- **Final evidence:**
  - `evidence05/final-test.txt`: exit code `0` — **9 test files passed (9), 72 tests passed (72)** (`R-02` locates Current Time, Start Time, and End Time via `getByLabelText`, sets Start Time to `1500`, and verifies the AC1 invalid-interval rejection and explanation through `App`).
  - `evidence05/final-lint.txt`: exit code `0`.
  - `evidence05/final-typecheck.txt`: exit code `0`.
  - `evidence05/final-build.txt`: exit code `0`.
- **Residual risk:**
  - Reduced from **4 (`2×2`)** to **2 (`1×2`)** — **open partial residual**. `TimeSelector` label association is fixed and verified by `R-02`, **but existing tests in `src/__tests__/App.test.tsx` and `src/__tests__/explain.test.tsx` still index `spinbutton[1]` and still change Current Time** because existing assertions must not be modified; migrating those legacy selectors remains an open follow-up task.

---

## 8. Agent-Readiness Audit

### Dimension-by-Dimension Assessment (Repo Evidence Only)

| Dimension | Rating | Observed Evidence | Gaps / Missing Evidence |
| --- | --- | --- | --- |
| **Structure** | Strong | Clear separation of pure domain modules (`availability.ts`, `roomFilters.ts`, `constants.ts`, `time.ts`), offline mock LLM (`src/llm/`), UI (`src/components/`), and tests (`src/__tests__/`). | `App.tsx` still duplicates duration conditionals and `mockAdapter.ts` duplicates `minutesToLabel` (`R-03`). |
| **README accuracy** | Weak / Stale | `README.md` documents features, tech stack, and limitations. | Still reports 44 tests across 6 files (actual: 72 tests across 9 files), omits `src/llm/` and `ExplainSection.tsx`, and recommends `npm install` instead of `npm ci`. `src/availability.ts:7` JSDoc contradicts line 29 (`R-05`). |
| **Reproducible setup** | Good | `package-lock.json` is committed and `npm ci` exits `0` (`evidence05/baseline-ci.txt`). | No Node.js/npm version pin (`engines` field or `.nvmrc`) in `package.json`. |
| **Pinned dependencies** | Partial | Exact versions are locked in `package-lock.json` for `npm ci`. | `package.json` uses caret (`^`) ranges, retains unused `@supabase/supabase-js`, and `npm audit` exits `1` with 25 advisories (`evidence05/dependency-audit.txt`). |
| **Tests** | Good | 72 passing tests across 9 files (`evidence05/final-test.txt`), fast execution (2.65s), covering AC1–AC5, room filters, `explainSafely`, and `R-01`/`R-02` regressions. | Legacy `App.test.tsx`/`explain.test.tsx` still index `spinbutton[1]` (`R-02` residual); no automated tests for `ExplainSection` retry/fallback/race UI states or filter-deselection (`R-06`); code coverage report **not executed**; browser/E2E & desktop/mobile tests **not executed**. |
| **Lint / Typecheck / Build** | Good (local only) | `npm run lint`, `npm run typecheck`, and `npm run build` all pass with exit code `0` (`evidence05/final-*.txt`). | `tsconfig.app.json` disables `noUnusedLocals` and `noUnusedParameters`; `typecheck` skips `tsconfig.node.json`; no CI workflow exists (`.github/` absent, `Test-Path .github` = `False` — CI execution **not executed**). |
| **Logging & Observability** | Weak / Absent | `explainSafely` degrades cleanly to `EXPLAIN_FALLBACK_TEXT` without throwing. | `Select-String` across `src/**/*` found 0 occurrences of `console.*`, `ErrorBoundary`, or `componentDidCatch`. No structured diagnostic logging or React error boundary exists. |
| **Security safeguards** | Partial | Client-only static app with 0 DOM/eval/network sinks in `src/` and 0 references to `supabase`/`realtime-js` in `src/` or `dist/assets/*`; `AGENTS.md` forbids secrets, external services, and production deployment. | `npm audit` fails with 25 advisories (exit code `1`); unused `@supabase/supabase-js` remains in `package.json`; automated secret-scanning tool **not executed**; no CI gate blocks vulnerable dependencies. |
| **AGENTS.md permissions** | Strong | Root `AGENTS.md` explicitly defines purpose, architecture, setup, safe commands (including `npm ci`), coding conventions, verified baseline test expectations, forbidden actions, and mandatory human approval before edits/merges. | Baseline count in `AGENTS.md` (70 tests / 8 files) predates the 2 new regression tests (72 tests / 9 files) and should be refreshed after merge. |

### Assigned Readiness Level: **Level 2 — Documented**
- **Justification:** The repository clearly exceeds **Level 1 (Baseline)** because it has a modular architecture, reproducible `npm ci`, fast automated tests (72/72 passing), clean lint/typecheck/build commands, and a concrete root `AGENTS.md` specifying safe commands, forbidden actions, and human-approval gates. However, it does **not** qualify for **Level 3 (Agent-ready)** because autonomous agents still face misleading/stale documentation (`README.md` and `availability.ts` JSDoc), no CI pipeline (`.github/` absent) to enforce verification gates automatically, 25 unresolved `npm audit` advisories + unused `@supabase/supabase-js`, legacy index-based UI tests targeting the wrong input (`R-02` residual), disabled unused-symbol compiler checks (`tsconfig.app.json`), no error boundary/logging, and unverified desktop/mobile layouts.
- **Missing evidence (not executed):**
  - CI pipeline / automated PR checks (`.github/` does not exist — **not executed**)
  - Manual or automated desktop/mobile responsive UI check (AC6 — **not executed**)
  - Browser end-to-end test suite (**not executed**)
  - Test coverage report (`vitest --coverage` — **not executed**)
  - Automated secret-scanning run (**not executed**)
  - Dependency upgrade / `npm audit fix` verification (**not executed**, prohibited without separate approval)

---

## 9. Hypothetical Background-Agent Task Design *(Not Executed)*

> **Status:** **Not executed** — design specification only.

- **Task Goal:** Resolve deferred maintainability risk **R-03** by extracting a pure interval-summary helper in `src/availability.ts`, wiring `src/App.tsx`'s duration hint to it, replacing duplicated `formatTime` in `src/llm/mockAdapter.ts` with `minutesToLabel` from `src/time.ts`, and adding focused unit tests without modifying existing assertions, fixtures, or dependencies.
- **Isolation (Branch / Worktree):**
  - Create a dedicated branch `agent/r03-interval-helper` inside an isolated `git worktree` (e.g., `../project-wt-r03`) branched from `main`. Never operate directly on `main` or the user's active working tree.
- **Allowed Files:**
  - *Read:* Entire repository (excluding `.env*` or external paths).
  - *Write (strict allowlist):*
    - `src/availability.ts`
    - `src/App.tsx`
    - `src/llm/mockAdapter.ts`
    - `src/__tests__/intervalSummary.test.ts` (new file only)
    - `evidence05/bg-r03/*` (artifact output directory only)
- **Allowed Commands:**
  - `npm ci`
  - `npm test`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - Read-only git inspection: `git status`, `git diff`, `git log -n 5`
- **Time Limit:**
  - Hard wall-clock limit: **15 minutes** total; **2 minutes** per individual command; maximum **2 retries** on transient environment errors (e.g., Windows sandbox `EPERM`).
- **Prohibited Operations:**
  - Any edit to `src/data.ts`, `package.json`, `package-lock.json`, `AGENTS.md`, or existing test files/assertions.
  - Any dependency installation/upgrade (`npm install`, `npm update`, `npm audit fix`).
  - Destructive git or filesystem commands (`git reset --hard`, `git checkout -- .`, `git clean -fd`, `git push --force`, `rm -rf`).
  - Pushing to `main`, auto-merging, deploying, accessing secrets/credentials, or calling external APIs/backends.
  - Introducing design patterns (Strategy/Adapter), UI redesigns, or changes to AC1–AC6.
- **Required Artifacts (written to `evidence05/bg-r03/`):**
  1. `summary.md` — Concise change summary, files touched, and AC1–AC6 preservation checklist.
  2. `changes.diff` — Complete unified `git diff` against `main`.
  3. `test.log` — Full `npm test` output and exit code (`0`, showing all 72 existing tests + new unit tests passing).
  4. `lint.log`, `typecheck.log`, `build.log` — Full command outputs and exit codes (`0` for each).
  5. `risk-notes.md` — Updated residual risk for `R-03`, edge cases checked (including negative/out-of-range inputs), and explicit statement of any checks not executed (e.g., manual desktop/mobile browser check).
- **Human Review Gate Before Merge:**
  - The agent stops after writing artifacts on `agent/r03-interval-helper` and presents a review packet. A human reviewer must inspect `changes.diff`, verify all artifact exit codes, perform desktop/mobile visual verification of the duration hint, and explicitly approve before merging into `main`.
- **Failure and Rollback Handling:**
  - If any command exits non-zero, any file outside the allowlist is modified, or the 15-minute timeout is reached, the agent immediately halts without committing or merging, writes failure diagnostics to `evidence05/bg-r03/failure.log`, and notifies the human reviewer.
  - Rollback is zero-risk because `main` is untouched: the orchestrator or human simply removes the isolated worktree and deletes the branch (`git worktree remove ../project-wt-r03` and `git branch -D agent/r03-interval-helper`).

---

## 10. Release Decision

### Decision: **CONDITIONAL**

#### Justification
- **Why not `NO-GO`:**
  - All four automated verification gates pass cleanly after the approved fixes: `npm test` (**72/72 tests across 9 files**, exit code `0`), `npm run lint` (exit code `0`), `npm run typecheck` (exit code `0`), and `npm run build` (exit code `0`, `dist/` built in 1.98s) (`evidence05/final-*.txt`).
  - Both top-ranked confirmed risks (**R-01** and **R-02**) were reproduced with failing tests (`evidence05/regressions-before.txt`), fixed with minimal diffs (`evidence05/R01.diff`, `evidence05/R02.diff`), and verified passing without touching fixtures, dependencies, or existing assertions.
  - Core booking rules AC1–AC5 remain intact, and the security XSS/secret-leakage claim (`R-07`) was challenged and classified `unsupported`.
- **Why not unconditional `GO` (conditions blocking unconditional release):**
  1. **AC6 visual verification not executed:** Desktop and mobile browser layout checks were **not executed** in this session (`R-06`).
  2. **Readiness is Level 2 (Documented), not Level 3:** No CI workflow exists (`.github/` absent) to enforce test/lint/typecheck/build gates automatically, and `README.md` / `availability.ts` JSDoc remain stale (`R-05`).
  3. **Open residual & deferred risks:**
     - `R-02` residual (`2`): existing tests in `App.test.tsx` and `explain.test.tsx` still index `spinbutton[1]` and mutate Current Time instead of Start Time.
     - `R-03` (`4`, deferred): `App.tsx` duration hint still diverges from AC1 bounds and `mockAdapter.ts` duplicates `minutesToLabel`.
     - `R-04` (`3`, deferred): `npm audit` fails with 25 advisories (2 critical, 14 high, 7 moderate, 2 low) and `package.json` still lists unused `@supabase/supabase-js` (not bundled into `dist/assets/*`, no runtime exploitability verified).

#### Conditions to Promote to `GO`
1. Execute and record a manual desktop + mobile viewport verification (AC6).
2. Review and approve a dedicated dependency-hygiene PR to remove unused `@supabase/supabase-js` and triage audited dev/build/test packages (`R-04`).
3. Update stale documentation (`README.md`, `src/availability.ts` JSDoc, `AGENTS.md` test count to 72/9) and schedule follow-up cleanup for `R-02`'s legacy `spinbutton[1]` test selectors and deferred `R-03`.
