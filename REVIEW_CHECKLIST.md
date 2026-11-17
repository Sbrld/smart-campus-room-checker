# Background Agent Review Checklist

Read-only checklist for reviewing work performed by a background coding agent on the Smart Campus Room Availability Checker. Every item must be verifiable against recorded evidence — a transcript, a tool output, or a diff. If no evidence exists for a claim, the claim is treated as unverified and the gate does not pass.

---

## 1. Isolation: Branch or Worktree

The agent must work on a separate branch or worktree, never on the default branch.

- [ ] Agent worked on a named branch or worktree (not `main` / `master`).
- [ ] No commits, files, or lockfile changes landed on the default branch.
- [ ] The branch name is descriptive of the task (e.g. `fix/time-validation`, not `patch-1`).

**Evidence required:** the branch name and the branch's first-commit ref. If git is unavailable in this environment (the project is not a git repo), the reviewer confirms isolation by other means — a separate working directory, a Bolt Version History snapshot, or an equivalent out-of-band separation — and records which method was used.

---

## 2. No Credentials

- [ ] No secrets, API keys, tokens, or credentials were added to any file (code, config, env, or docs).
- [ ] No `.env` file was created or committed.
- [ ] No hardcoded connection strings or bearer tokens appear in the diff.
- [ ] If the agent referenced environment variables, it used names only — never values.

**Evidence required:** a grep of the diff for `api_key`, `secret`, `token`, `password`, `bearer`, `Authorization`, and `.env`. Record the grep result (zero matches or list the matches with justification).

---

## 3. No Deployment

- [ ] No `push`, `merge`, `deploy`, `publish`, or remote-domain commands were run.
- [ ] No CI/CD pipeline was modified or triggered.
- [ ] No package was published to a registry.
- [ ] No external service was called with project data.

**Evidence required:** a statement listing every shell command the agent executed, filtered to network/push/deploy verbs. If the list is empty, record "no deployment actions taken."

---

## 4. Test and Build Commands

Every command must have been actually executed by a real tool call. Stating "tests pass" without a recorded run is not acceptable.

Run all five and record the real exit codes and tail output:

| Command | Purpose | Pass criterion |
|---|---|---|
| `npm test` | Unit + UI tests (Vitest) | All tests pass, exit 0 |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) | No errors, exit 0 |
| `npm run lint` | ESLint across project | No errors, exit 0 |
| `npm run build` | Production build (`vite build`) | Build succeeds, exit 0 |
| `npm audit --omit=dev` | Production dependency audit | 0 vulnerabilities (or documented exceptions) |

- [ ] `npm test` — real output recorded, exit code 0, test count matches expectation.
- [ ] `npm run typecheck` — real output recorded, exit code 0.
- [ ] `npm run lint` — real output recorded, exit code 0.
- [ ] `npm run build` — real output recorded, exit code 0.
- [ ] `npm audit --omit=dev` — real output recorded.

**Evidence required:** for each command, the actual terminal output (at minimum the final lines and the exit code). Paraphrased summaries like "tests passed" are insufficient — the raw output must be in the transcript.

**On failure:** if any command fails, the agent must fix the root cause and re-run. Suppressing, editing, or truncating failing output to manufacture a pass is a gate-blocking violation.

---

## 5. Acceptance Criteria Still Hold

Confirm AC1–AC6 are preserved (from AGENTS.md):

- [ ] **AC1:** Invalid intervals (start not before end, outside 0–1440) and start-not-after-current-time are rejected.
- [ ] **AC2:** Max booking duration is 120 minutes; 121+ is rejected.
- [ ] **AC3:** Blocked rooms are rejected.
- [ ] **AC4:** Real overlaps with same-room bookings are rejected; touching endpoints are allowed.
- [ ] **AC5:** No mutation of booking/room fixture data (no sort/splice/edit in place).
- [ ] **AC6:** Result and validation messages remain visible and readable on desktop and mobile widths.

**Evidence required:** test output showing the relevant tests (T01–T20, U1–U10) pass. For AC6 (responsive layout), if no browser is available the reviewer states that explicitly and verifies the responsive Tailwind classes by reading the code — that code read must be recorded too.

---

## 6. Risk Register Updates

The reviewer checks whether the agent introduced, mitigated, or acknowledged risks:

- [ ] **Unused dependencies:** no new dependency was added without a concrete, documented import site. If an unused dependency was removed, the removal is confirmed in the diff and lockfile.
- [ ] **Input validation:** any new input path has validation at the boundary. Malformed inputs produce a clear user-facing message, not a silent default.
- [ ] **Data mutation:** no new code sorts, splices, or mutates fixture arrays in place.
- [ ] **Scope creep:** no backend, database, auth, or persistence code was added. No new libraries beyond what the task requires.
- [ ] **Existing labels/messages:** preserved exactly as written (per AGENTS.md engineering rules).

**Evidence required:** for each item, either a pointer to the relevant diff hunk or a statement that no change was needed. New risks discovered during review are recorded here before approval.

---

## 7. Evidence for Each Claim

Every claim the agent makes in its summary must be traceable to a recorded action:

- [ ] Each "tests pass" claim links to a real `npm test` output block.
- [ ] Each "build succeeds" claim links to a real `npm run build` output block.
- [ ] Each "file X was changed" claim links to a diff or file-write record.
- [ ] Each "no credentials" claim links to a grep result.
- [ ] If the agent claims it ran a command but no tool execution is recorded, the claim is **false** and the gate blocks.

**Rule:** no recorded tool execution = the agent did not run it. Do not infer, assume, or credit unrecorded actions.

---

## 8. Summary of Changed Files

The agent must provide a plain-language list of every file touched and what changed in it. The reviewer verifies this list against the actual diff:

- [ ] Every file in the diff appears in the summary.
- [ ] Every file in the summary appears in the diff (no phantom changes claimed).
- [ ] The description for each file matches what the diff actually does.
- [ ] Files that were only regenerated (e.g. `package-lock.json` via `npm install`) are identified as such.

**Evidence required:** the file list from the summary cross-checked against the actual changed-file set. Discrepancies are gate-blocking.

---

## 9. Human Approval Gate

This is the final gate. None of the above items are self-certified by the agent — a human reviewer must confirm each one.

- [ ] All items in sections 1–8 are checked and evidence is recorded.
- [ ] Any unchecked item has a documented justification or a follow-up task.
- [ ] The reviewer has read the full diff, not just the summary.
- [ ] The reviewer explicitly approves: "Approved for merge."
- [ ] **No merge, push, or deploy happens before this approval is recorded.**

**Approval statement (to be filled by the human reviewer):**

> Reviewer: ____________________
> Date: ____________________
> Verdict: [ ] Approved  [ ] Changes requested  [ ] Rejected
> Notes: ____________________

---

## Quick reference: commands

```bash
npm test                    # Vitest run — all unit + UI tests
npm run typecheck           # tsc --noEmit
npm run lint                # ESLint
npm run build               # vite build
npm audit --omit=dev        # production-only vulnerability audit
```
