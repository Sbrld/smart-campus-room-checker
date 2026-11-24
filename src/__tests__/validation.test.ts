import { describe, it, expect } from 'vitest';
import { validateBookingInputs } from '../validation';

describe('validateBookingInputs', () => {
  it('rejects a missing room selection', () => {
    expect(validateBookingInputs(null, 600, 660, 480)).toEqual({
      code: 'NO_ROOM_SELECTED',
      message: 'Please select a room first.',
    });
  });

  it('accepts an empty-string room id as missing', () => {
    expect(validateBookingInputs('', 600, 660, 480)?.code).toBe('NO_ROOM_SELECTED');
  });

  it('flags non-finite numbers as invalid input', () => {
    expect(validateBookingInputs('r1', NaN, 660, 480)?.code).toBe('INVALID_INPUT');
    expect(validateBookingInputs('r1', 600, Infinity, 480)?.code).toBe('INVALID_INPUT');
  });

  it('flags intervals outside 0–1440 or with start ≥ end as invalid input', () => {
    expect(validateBookingInputs('r1', -1, 60, 480)?.code).toBe('INVALID_INPUT');
    expect(validateBookingInputs('r1', 1380, 1441, 480)?.code).toBe('INVALID_INPUT');
    expect(validateBookingInputs('r1', 720, 720, 480)?.code).toBe('INVALID_INPUT');
    expect(validateBookingInputs('r1', 750, 720, 480)?.code).toBe('INVALID_INPUT');
  });

  it('flags a start at or before the current time as PAST_START_TIME', () => {
    expect(validateBookingInputs('r1', 480, 540, 480)?.code).toBe('PAST_START_TIME');
    expect(validateBookingInputs('r1', 0, 60, 480)?.code).toBe('PAST_START_TIME');
  });

  it('returns null for well-formed inputs, including boundary values', () => {
    expect(validateBookingInputs('r1', 481, 1440, 480)).toBeNull();
  });

  it('runs before business rules — a valid 3-hour window passes validation', () => {
    // 180 minutes is over the 120-minute cap, but that is availability.ts's
    // job; structurally this input is fine.
    expect(validateBookingInputs('r1', 600, 780, 480)).toBeNull();
  });
});
