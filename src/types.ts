export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
}

export interface CheckInputs {
  roomId: string | null;
  start: number;
  end: number;
  currentTime: number;
}

export type ReasonCode =
  | 'AVAILABLE'
  | 'NO_ROOM_SELECTED'
  | 'PAST_START_TIME'
  | 'INVALID_INPUT'
  | 'INVALID_DURATION'
  | 'ROOM_BLOCKED'
  | 'BOOKING_OVERLAP';

export type AvailabilityResult = {
  available: boolean;
  reasonCode: ReasonCode;
  message: string;
};
