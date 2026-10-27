import type { Room } from '@/types';

export const sampleRooms: Room[] = [
  {
    id: 'r1',
    name: 'Engineering Hall A',
    building: 'Engineering Block',
    capacity: 40,
    blocked: false,
    bookings: [
      { id: 'b1', start: 540, end: 600, title: 'Intro to Circuits', bookedBy: 'Prof. Chen' },
      { id: 'b2', start: 720, end: 780, title: 'Lab Session', bookedBy: 'Prof. Chen' },
      { id: 'b3', start: 900, end: 960, title: 'Study Group', bookedBy: 'Student Union' },
    ],
  },
  {
    id: 'r2',
    name: 'Science Lab 3',
    building: 'Sciences Wing',
    capacity: 24,
    blocked: false,
    bookings: [
      { id: 'b4', start: 600, end: 660, title: 'Chemistry 201', bookedBy: 'Prof. Patel' },
      { id: 'b5', start: 840, end: 930, title: 'Physics Lab', bookedBy: 'Prof. Lee' },
    ],
  },
  {
    id: 'r3',
    name: 'Business Room 101',
    building: 'Business Center',
    capacity: 60,
    blocked: true,
    blockedReason: 'Maintenance scheduled',
    bookings: [],
  },
  {
    id: 'r4',
    name: 'Library Study Room B',
    building: 'Main Library',
    capacity: 12,
    blocked: false,
    bookings: [
      { id: 'b6', start: 480, end: 540, title: 'Morning Study', bookedBy: 'Library Staff' },
      { id: 'b7', start: 780, end: 840, title: 'Book Club', bookedBy: 'Student Union' },
    ],
  },
];
