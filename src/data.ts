import type { Booking, Room } from '@/types';

export const rooms: Room[] = [
  { id: 'A101', name: 'Lecture Hall A101', building: 'North Wing', capacity: 120, equipment: ['Projector', 'Microphone', 'Whiteboard', 'Video conferencing'], blocked: false },
  { id: 'B204', name: 'Lab B204', building: 'Engineering Block', capacity: 40, equipment: ['Lab benches', 'Fume hood', 'Projector', 'Whiteboard'], blocked: false },
  { id: 'C310', name: 'Seminar Room C310', building: 'Central Hub', capacity: 24, equipment: ['Projector', 'Whiteboard'], blocked: true },
  { id: 'D105', name: 'Study Lounge D105', building: 'Library', capacity: 16, equipment: ['Power outlets', 'Whiteboard'], blocked: false },
  { id: 'E220', name: 'Project Room E220', building: 'East Pavilion', capacity: 8, equipment: ['Smart TV', 'Video conferencing', 'Whiteboard'], blocked: false },
];

export const bookings: Booking[] = [
  { id: 'b1', roomId: 'A101', start: 540, end: 630, bookedBy: 'CS Dept.' },
  { id: 'b2', roomId: 'A101', start: 900, end: 990, bookedBy: 'Math Club' },
  { id: 'b3', roomId: 'B204', start: 600, end: 660, bookedBy: 'Robotics Team' },
  { id: 'b4', roomId: 'B204', start: 780, end: 840, bookedBy: 'Physics Lab' },
  { id: 'b5', roomId: 'D105', start: 480, end: 540, bookedBy: 'Study Group' },
  { id: 'b6', roomId: 'D105', start: 1020, end: 1080, bookedBy: 'Book Club' },
  { id: 'b7', roomId: 'E220', start: 660, end: 720, bookedBy: 'Capstone Team' },
  { id: 'b8', roomId: 'E220', start: 840, end: 900, bookedBy: 'Design Sprint' },
];

export const equipmentOptions: string[] = [...new Set(rooms.flatMap((room) => room.equipment))].sort();

export const MAX_BOOKING_MINUTES = 120;
export const DAY_MINUTES = 1440;
