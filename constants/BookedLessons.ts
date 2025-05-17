import { format, addDays } from 'date-fns';

export interface BookedLesson {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string; // e.g., "Driving Lesson"
  type: string; // e.g., "Standard Drive"
  location?: string;
  instructorId?: string;
  studentId?: string;
  status?: 'booked' | 'completed' | 'cancelled'; // Optional status
  feedbackGiven?: boolean; // New property
  // ... any other properties
}

export const bookedLessons: BookedLesson[] = [
  {
    id: '1',
    date: '2025-05-20', // Future date
    startTime: '17:00',
    endTime: '18:30',
    title: 'Evening Drive',
    type: 'Highway Practice',
    location: 'City Center Routes',
    feedbackGiven: false, // Or undefined
  },
  {
    id: '2',
    date: '2025-05-15', // Past date
    startTime: '10:00',
    endTime: '11:00',
    title: 'Morning Session',
    type: 'Parking Skills',
    location: 'Training Ground X',
    feedbackGiven: false, // Needs feedback
  },
  {
    id: '3',
    date: '2025-05-10', // Past date
    startTime: '14:00',
    endTime: '15:00',
    title: 'Afternoon Review',
    type: 'Observation',
    location: 'Suburban Roads',
    feedbackGiven: true, // Feedback already provided
  },
  {
    id: '4',
    date: format(new Date(), 'yyyy-MM-dd'), // For today, easy testing
    startTime: '10:00',
    endTime: '12:00', // 2-hour lesson
    title: 'Event 246',
    type: 'lesson',
    location: 'imagine street, london',
  },
  {
    id: '5',
    date: format(new Date(), 'yyyy-MM-dd'), // For today
    startTime: '14:00',
    endTime: '15:00', // 1-hour lesson
    title: 'Event 250',
    type: 'lesson',
  },
  {
    id: '6',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // For tomorrow
    startTime: '11:00',
    endTime: '13:00',
    title: 'Event 254',
    type: ''
  },
  {
    id: '7',
    date: format(new Date(), 'yyyy-MM-dd'), // For tomorrow
    startTime: '20:00',
    endTime: '22:00', // Assuming a 1-hour lesson
    title: 'Early Bird Meeting',
    type: ''
  },
];