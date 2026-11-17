import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '@/App';
import { bookings as importedBookings } from '@/data';
import type { Booking } from '@/types';

const B204 = 'Lab B204';
const C310 = 'Seminar Room C310';

function selectRoom(roomName: string) {
  const card = screen.getByRole('button', { name: new RegExp(roomName) });
  fireEvent.click(card);
}

function setField(labelText: string, value: string) {
  const input = screen.getByLabelText(labelText) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

function clickCheck() {
  fireEvent.click(screen.getByRole('button', { name: /Check availability/i }));
}

describe('App page integration', () => {
  it('U1: available room shows Available, then blocked room shows Unavailable and bookings are unchanged', () => {
    const snapshot: Booking[] = structuredClone(importedBookings);
    render(<App />);

    selectRoom(B204);
    setField('Start time', '11:00');
    setField('End time', '12:00');
    clickCheck();

    expect(screen.getByText('Available')).toBeInTheDocument();

    selectRoom(C310);
    clickCheck();

    expect(screen.queryByText('Available')).not.toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();

    expect(importedBookings).toEqual(snapshot);
  });

  it('U2: empty current time shows Unavailable with a clear message', () => {
    render(<App />);

    selectRoom(B204);
    setField('Start time', '11:00');
    setField('End time', '12:00');
    setField('Current time', '');
    clickCheck();

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/Please enter current, start, and end times/i),
    ).toBeInTheDocument();
  });

  it('U3: attendee count above every capacity shows the empty state', () => {
    render(<App />);

    setField('Number of attendees', '200');

    expect(screen.getByText('No rooms match your filters')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lecture Hall A101/ })).not.toBeInTheDocument();
  });

  it('U4: invalid attendee count shows an error and hides room results', () => {
    render(<App />);

    setField('Number of attendees', '0');

    expect(screen.getByRole('alert')).toHaveTextContent(/whole number of attendees/i);
    expect(screen.queryByRole('button', { name: /Lab B204/ })).not.toBeInTheDocument();
  });

  it('U5: changing an equipment filter clears the stale result and moves selection to a matching room', () => {
    render(<App />);

    selectRoom(B204);
    setField('Start time', '11:00');
    setField('End time', '12:00');
    clickCheck();
    expect(screen.getByText('Available')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Video conferencing'));

    expect(screen.queryByText('Available')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lab B204/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lecture Hall A101/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('U6: attendee count equal to a room capacity shows that room and hides smaller rooms', () => {
    render(<App />);

    setField('Number of attendees', '40');

    expect(screen.getByRole('button', { name: /Lab B204/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Seminar Room C310/ })).not.toBeInTheDocument();
  });

  it('U7: multiple equipment requirements must all match', () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText('Projector'));
    fireEvent.click(screen.getByLabelText('Microphone'));

    expect(screen.getByRole('button', { name: /Lecture Hall A101/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lab B204/ })).not.toBeInTheDocument();
  });

  it('U8: changing the attendee count clears a stale availability result', () => {
    render(<App />);

    selectRoom(B204);
    setField('Start time', '11:00');
    setField('End time', '12:00');
    clickCheck();
    expect(screen.getByText('Available')).toBeInTheDocument();

    setField('Number of attendees', '10');

    expect(screen.queryByText('Available')).not.toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  });

  it('U9: selecting a different room clears the previous availability result', () => {
    render(<App />);

    selectRoom(B204);
    setField('Start time', '11:00');
    setField('End time', '12:00');
    clickCheck();
    expect(screen.getByText('Available')).toBeInTheDocument();

    selectRoom(C310);

    expect(screen.queryByText('Available')).not.toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  });

  it('U10: malformed time input shows Unavailable with a clear message', () => {
    render(<App />);

    selectRoom(B204);
    setField('Start time', 'ab:cd');
    setField('End time', '12:00');
    setField('Current time', '09:00');
    clickCheck();

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/Please enter current, start, and end times/i),
    ).toBeInTheDocument();
  });
});
