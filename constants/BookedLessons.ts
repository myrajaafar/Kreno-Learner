import { format, addDays } from 'date-fns';

interface BookedLesson {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  color: string; // Tailwind background color class e.g., 'bg-red-400'
}

const staticBookedLessons: BookedLesson[] = [
  {
    id: '1',
    date: format(new Date(), 'yyyy-MM-dd'), // For today, easy testing
    startTime: '10:00',
    endTime: '12:00', // 2-hour lesson
    title: 'Event 246',
    color: 'bg-red-400',
  },
  {
    id: '2',
    date: format(new Date(), 'yyyy-MM-dd'), // For today
    startTime: '14:00',
    endTime: '15:00', // 1-hour lesson
    title: 'Event 250',
    color: 'bg-red-400',
  },
  {
    id: '3',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // For tomorrow
    startTime: '11:00',
    endTime: '13:00',
    title: 'Event 254',
    color: 'bg-red-400',
  },
  { 
    id: '4',
    date: format(new Date(), 'yyyy-MM-dd'), // For tomorrow
    startTime: '20:00',
    endTime: '22:00', // Assuming a 1-hour lesson
    title: 'Early Bird Meeting',
    color: 'bg-red-400', // Example color, ensure this is in your Tailwind config
  },
];

export { staticBookedLessons, BookedLesson };