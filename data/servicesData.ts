import { format, parse, addDays } from 'date-fns';

export interface Service {
  id: string;
  type: string;
  displayDate: string;
  displayTimeRange: string;
  status: string;
  statusColor: string;
  price: string; // e.g., "$50.00" or "50 EUR"
  location: string;
  userName: string;
  rawDate: Date; 
}

// Interface for  Lessons
export interface Lesson {
  lessonId: string;
  title: string; // Could be the service type or a more specific lesson focus
  date: string; // Formatted date string
  time: string; // Formatted time range string
  status: string;
  location: string;
  instructorName: string; // Assuming userName is the instructor
  rawDate: Date;
}

const transformServiceData = (
  oldTime: string, 
  price: string, 
  location: string, 
  userName: string
): { displayDate: string; displayTimeRange: string; price: string; location: string; userName: string; rawDate: Date } => {
  const parts = oldTime.split(' ');
  const timeRange = parts[0] + ' ' + parts[1] + ' ' + parts[2]; // e.g., "17:00 - 18:30"
  const dateStr = parts[3]; // e.g., "dd/MM/yyyy"

  const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
  const displayDate = format(parsedDate, 'EEEE d MMMM yyyy');

  return {
    displayDate,
    displayTimeRange: timeRange,
    price,
    location,
    userName,
    rawDate: parsedDate,
  };
};

const today = new Date(); // Dynamically set to the current day

export const servicesData: Service[] = [
  {
    id: 'S1',
    type: 'Driving Lesson',
    ...transformServiceData(`14:00 - 15:00 ${format(today, 'dd/MM/yyyy')}`, '€50.00', 'City Center Route', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: 'S2',
    type: 'Theory Test Prep',
    ...transformServiceData(`10:00 - 11:30 ${format(addDays(today, 1), 'dd/MM/yyyy')}`, '€30.00', 'Online Classroom', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: 'S3',
    type: 'Driving Lesson',
    ...transformServiceData(`09:00 - 10:00 ${format(addDays(today, 2), 'dd/MM/yyyy')}`, '€50.00', 'Highway Practice', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: 'S4',
    type: 'Mock Driving Test',
    ...transformServiceData(`16:00 - 17:30 ${format(addDays(today, 2), 'dd/MM/yyyy')}`, '€75.00', 'Official Test Routes', 'Myra Jaafar'),
    status: 'Pending',
    statusColor: 'text-orange-500',
  },
  {
    id: 'S5',
    type: 'Driving Lesson',
    ...transformServiceData(`11:00 - 12:00 ${format(addDays(today, 3), 'dd/MM/yyyy')}`, '€50.00', 'Night Driving Simulation', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: 'S6',
    type: 'Advanced Driving Skills',
    ...transformServiceData(`17:00 - 18:30 ${format(addDays(today, 3), 'dd/MM/yyyy')}`, '€65.00', 'Skid Pan & Control', 'Myra Jaafar'),
    status: 'Pending',
    statusColor: 'text-orange-500',
  },
  {
    id: 'S7',
    type: 'Driving Lesson',
    ...transformServiceData(`13:00 - 14:00 ${format(addDays(today, 4), 'dd/MM/yyyy')}`, '€50.00', 'Defensive Driving', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: 'S8',
    type: 'Theory Test Prep',
    ...transformServiceData(`15:30 - 17:00 ${format(addDays(today, 4), 'dd/MM/yyyy')}`, '€30.00', 'Online Classroom', 'Myra Jaafar'),
    status: 'Pending',
    statusColor: 'text-orange-500',
  },
  {
    id: 'S9',
    type: 'Driving Lesson',
    ...transformServiceData(`10:30 - 11:30 ${format(addDays(today, 5), 'dd/MM/yyyy')}`, '€50.00', 'Parallel Parking', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: 'S10',
    type: 'Mock Driving Test',
    ...transformServiceData(`14:00 - 15:30 ${format(addDays(today, 6), 'dd/MM/yyyy')}`, '€75.00', 'Official Test Routes', 'Myra Jaafar'),
    status: 'Pending',
    statusColor: 'text-orange-500',
  },
];

// New: Data for  Driving Lessons
export const LessonsData: Lesson[] = servicesData
  .filter(service => service.type === 'Driving Lesson')
  .map(service => ({
    lessonId: service.id,
    title: service.location, // Using location as a more specific title for the lesson
    date: service.displayDate,
    time: service.displayTimeRange,
    status: service.status,
    location: service.location,
    instructorName: service.userName,
    rawDate: service.rawDate,
  }));