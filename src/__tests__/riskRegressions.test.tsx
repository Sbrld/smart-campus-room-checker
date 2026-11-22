/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import App from '../App';
import { checkAvailability } from '../availability';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS } from '../data';
import { explainSafely, EXPLAIN_FALLBACK_TEXT } from '../llm/explain';
import { mockLlmAdapter } from '../llm/mockAdapter';

afterEach(() => cleanup());

describe('Risk regression tests (R-01, R-02)', () => {
  it('R-01: explains multi-reason unavailability without degrading to fallback', async () => {
    const blockedRoom = SAMPLE_ROOMS.find((r) => r.blocked)!;
    // Triggers both AC2 (>120 min) and AC3 (blocked room)
    const verdict = checkAvailability(blockedRoom, 600, 780, 480, SAMPLE_BOOKINGS);
    expect(verdict.decision).toBe('unavailable');
    expect(verdict.reasons.length).toBeGreaterThanOrEqual(2);

    const res = await explainSafely(mockLlmAdapter, {
      decision: verdict.decision,
      reasons: verdict.reasons,
      roomName: blockedRoom.name,
      start: 600,
      end: 780,
    });

    expect(res.text).not.toBe(EXPLAIN_FALLBACK_TEXT);
    expect(res.text).toContain(blockedRoom.name);
    expect(res.text).toContain('Bookings cannot be longer than 120 minutes');
    expect(res.text).toContain('This room is currently blocked and cannot be booked');
  });

  it('R-02: associates TimeSelector labels with inputs so Start Time edits trigger the invalid-interval rule', async () => {
    render(<App />);

    expect(screen.getByLabelText(/Current Time/i)).toBeTruthy();
    const startInput = screen.getByLabelText(/Start Time/i);
    expect(screen.getByLabelText(/End Time/i)).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /Lecture Hall A/i })[0]);
    fireEvent.change(startInput, { target: { value: '1500' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Availability/i }));

    expect(screen.getByText('Unavailable')).toBeTruthy();
    expect(screen.getByText(/Interval must satisfy/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /explain availability/i }));
    await waitFor(() =>
      expect(screen.getByText(/AI explanation \(mock\)/i)).toBeTruthy()
    );
    expect(screen.getByText(/Lecture Hall A cannot be booked/).textContent).toContain(
      'Interval must satisfy'
    );
  });
});
