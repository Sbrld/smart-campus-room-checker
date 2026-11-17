
---
name: bug-detector
description: Diagnose bugs in existing code using acceptance criteria and failing tests. Use when reviewing the Smart Campus booking application.
---

# Bug Detector

## Purpose

Find and explain bugs in the Smart Campus Room Availability Checker.

Focus on reproducible evidence, root causes, and minimal fixes.

## Procedure

1. Read the acceptance criteria, source code, and observed test failure.
2. Reproduce the defect using the smallest deterministic input.
3. Identify the likely root cause and relevant code lines.
4. Separate confirmed defects from unverified hypotheses.
5. Suggest a minimal fix, but do not edit the code yet.
6. Propose a regression test with its expected result.
7. Output the findings using this format:

   - Defect
   - Evidence
   - Root cause
   - Minimal fix
   - Regression test

## Acceptance Criteria

- AC1: Reject invalid time intervals and requests in the past.
- AC2: Reject bookings longer than 120 minutes.
- AC3: Reject bookings for blocked rooms.
- AC4: Reject overlapping bookings. Touching endpoints are allowed.
- AC5: Return availability without modifying booking data.
- AC6: Show clear feedback on desktop and mobile devices.

## Rules

- Do not invent test results.
- Do not claim a defect is confirmed without evidence.
- Do not rewrite unrelated code.
- Prefer the smallest possible patch.
- Explain why the proposed fix works.
- Keep explanations clear and concise.
- Do not edit files unless the user explicitly approves.
