import { format, addDays, subDays, setHours, setMinutes, addMinutes } from 'date-fns';

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

const today = new Date();

const generateTime = (date: Date, hour: number, minute: number, durationMinutes: number): { startTime: string, endTime: string } => {
  const startDate = setMinutes(setHours(date, hour), minute);
  const endDate = addMinutes(startDate, durationMinutes);
  return {
    startTime: format(startDate, 'HH:mm'),
    endTime: format(endDate, 'HH:mm'),
  };
};

export const bookedLessons: BookedLesson[] = [
  // --- Past Lessons ---
  {
    id: 'L001',
    date: format(subDays(today, 15), 'yyyy-MM-dd'),
    ...generateTime(subDays(today, 15), 9, 0, 90), // 9:00 - 10:30
    title: 'Introductory Session',
    type: 'Beginner Skills',
    location: 'Quiet Residential Area',
    instructorId: 'INST001',
    studentId: 'STUD001',
    status: 'completed',
    feedbackGiven: true,
  },
  {
    id: 'L002',
    date: format(subDays(today, 10), 'yyyy-MM-dd'),
    ...generateTime(subDays(today, 10), 14, 30, 60), // 14:30 - 15:30
    title: 'Manoeuvres Practice',
    type: 'Parking & Reversing',
    location: 'Training Ground Alpha',
    instructorId: 'INST002',
    studentId: 'STUD001',
    status: 'completed',
    feedbackGiven: true,
  },
  {
    id: 'L003',
    date: format(subDays(today, 7), 'yyyy-MM-dd'),
    ...generateTime(subDays(today, 7), 11, 0, 120), // 11:00 - 13:00
    title: 'City Driving Exposure',
    type: 'Urban Navigation',
    location: 'Downtown Core',
    instructorId: 'INST001',
    studentId: 'STUD002',
    status: 'completed',
    feedbackGiven: false, // Needs feedback
  },
  {
    id: 'L004',
    date: format(subDays(today, 5), 'yyyy-MM-dd'),
    ...generateTime(subDays(today, 5), 16, 0, 60), // 16:00 - 17:00
    title: 'Roundabout Mastery',
    type: 'Complex Junctions',
    location: 'Multi-Lane Roundabouts Zone',
    instructorId: 'INST003',
    studentId: 'STUD003',
    status: 'completed',
    feedbackGiven: false, // Needs feedback
  },
  {
    id: 'L005',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    ...generateTime(subDays(today, 2), 10, 0, 90), // 10:00 - 11:30
    title: 'Highway Confidence',
    type: 'Speed Management',
    location: 'National Route A1',
    instructorId: 'INST001',
    studentId: 'STUD001',
    status: 'completed',
    // feedbackGiven: undefined, // Implicitly needs feedback
  },

  // --- Today's Lessons ---
  {
    id: 'L006',
    date: format(today, 'yyyy-MM-dd'),
    ...generateTime(today, 8, 0, 60), // 08:00 - 09:00 (Potentially past if run late in day)
    title: 'Early Bird Refresher',
    type: 'General Practice',
    location: 'Local Test Routes',
    instructorId: 'INST002',
    studentId: 'STUD004',
    status: 'booked',
    // feedbackGiven: false (will be false once completed)
  },
  {
    id: 'L007',
    date: format(today, 'yyyy-MM-dd'),
    ...generateTime(today, 13, 0, 120), // 13:00 - 15:00
    title: 'Pre-Test Simulation',
    type: 'Mock Test',
    location: 'Official Test Center Area',
    instructorId: 'INST001',
    studentId: 'STUD002',
    status: 'booked',
  },
  {
    id: 'L008',
    date: format(today, 'yyyy-MM-dd'),
    ...generateTime(today, 17, 30, 60), // 17:30 - 18:30
    title: 'Evening Commute Practice',
    type: 'Rush Hour Navigation',
    location: 'Main Arterial Roads',
    instructorId: 'INST003',
    studentId: 'STUD003',
    status: 'booked',
  },

  // --- Future Lessons ---
  {
    id: 'L009',
    date: format(addDays(today, 1), 'yyyy-MM-dd'), // Tomorrow
    ...generateTime(addDays(today, 1), 10, 0, 90),
    title: 'Defensive Driving Techniques',
    type: 'Hazard Perception',
    location: 'Varied Road Conditions',
    instructorId: 'INST001',
    studentId: 'STUD001',
    status: 'booked',
  },
  {
    id: 'L010',
    date: format(addDays(today, 2), 'yyyy-MM-dd'),
    ...generateTime(addDays(today, 2), 15, 0, 60),
    title: 'Night Driving Introduction',
    type: 'Low Light Conditions',
    location: 'Quiet Roads & Main Roads',
    instructorId: 'INST002',
    studentId: 'STUD004',
    status: 'booked',
  },
  {
    id: 'L011',
    date: format(addDays(today, 3), 'yyyy-MM-dd'),
    ...generateTime(addDays(today, 3), 9, 30, 120),
    title: 'Advanced Parking',
    type: 'Parallel & Bay Parking',
    location: 'Shopping Center Car Park',
    instructorId: 'INST003',
    studentId: 'STUD002',
    status: 'booked',
  },
  {
    id: 'L012',
    date: format(addDays(today, 5), 'yyyy-MM-dd'),
    ...generateTime(addDays(today, 5), 11, 0, 90),
    title: 'Eco-Driving Principles',
    type: 'Fuel Efficiency',
    location: 'Mixed Urban/Rural Route',
    instructorId: 'INST001',
    studentId: 'STUD003',
    status: 'booked',
  },
  {
    id: 'L013',
    date: format(addDays(today, 7), 'yyyy-MM-dd'), // One week from today
    ...generateTime(addDays(today, 7), 14, 0, 60),
    title: 'Weather Conditions Practice',
    type: 'Wet Roads Simulation',
    location: 'Skid Pan Facility',
    instructorId: 'INST002',
    studentId: 'STUD001',
    status: 'booked',
  },
  {
    id: 'L014',
    date: format(addDays(today, 10), 'yyyy-MM-dd'),
    ...generateTime(addDays(today, 10), 10, 0, 120),
    title: 'Long Distance Drive Prep',
    type: 'Motorway & Sustained Driving',
    location: 'Intercity Highway M5',
    instructorId: 'INST001',
    studentId: 'STUD004',
    status: 'booked',
  },
  {
    id: 'L015',
    date: format(addDays(today, 14), 'yyyy-MM-dd'), // Two weeks from today
    ...generateTime(addDays(today, 14), 16, 30, 90),
    title: 'Final Test Route Review',
    type: 'Mock Test - Fine Tuning',
    location: 'Official Test Routes',
    instructorId: 'INST003',
    studentId: 'STUD002',
    status: 'booked',
  },
  // Example of a cancelled lesson
  {
    id: 'L016',
    date: format(subDays(today, 3), 'yyyy-MM-dd'), // Past cancelled lesson
    ...generateTime(subDays(today, 3), 13, 0, 60),
    title: 'Cancelled Session',
    type: 'General Practice',
    location: 'Local Area',
    instructorId: 'INST002',
    studentId: 'STUD003',
    status: 'cancelled',
    feedbackGiven: false, // No feedback for cancelled
  },
];