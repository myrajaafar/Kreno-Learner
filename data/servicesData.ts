import { format, parse } from 'date-fns';

export interface Service {
  id: string;
  type: string;
  displayDate: string;
  displayTimeRange: string;
  status: string;
  statusColor: string;
  price: string; // e.g., "$50.00" or "50 EUR"
  location: string;
  userName: string; // Assuming user name is associated with each service for this example
  // You might also want a raw date object if you need to sort history by date
  rawDate: Date; 
}

const transformServiceData = (
  oldTime: string, 
  price: string, 
  location: string, 
  userName: string
): { displayDate: string; displayTimeRange: string; price: string; location: string; userName: string; rawDate: Date } => {
  const parts = oldTime.split(' ');
  const timeRange = parts[0] + ' ' + parts[1] + ' ' + parts[2];
  const dateStr = parts[3];

  const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
  const displayDate = format(parsedDate, 'EEEE d MMMM yyyy');

  return {
    displayDate,
    displayTimeRange: timeRange,
    price,
    location,
    userName,
    rawDate: parsedDate, // Store the parsed date object
  };
};

export const servicesData: Service[] = [
  {
    id: '1',
    type: 'Consultation', // Changed type for variety
    ...transformServiceData('17:00 - 18:30 25/05/2025', '€75.00', 'Main Office, Room A', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: '2',
    type: 'Workshop',
    ...transformServiceData('10:00 - 12:00 26/05/2025', '€120.00', 'Online via Zoom', 'Myra Jaafar'),
    status: 'Pending',
    statusColor: 'text-orange-500',
  },
  {
    id: '3',
    type: 'Consultation', // Same type as id: '1' for history
    ...transformServiceData('14:00 - 15:00 20/05/2025', '€70.00', 'Client Site', 'Myra Jaafar'),
    status: 'Active', // Example: a past active consultation
    statusColor: 'text-green-500',
  },
  {
    id: '4',
    type: 'Support Call',
    ...transformServiceData('09:00 - 09:30 27/05/2025', '€30.00', 'Remote', 'Myra Jaafar'),
    status: 'Active',
    statusColor: 'text-green-500',
  },
  {
    id: '5',
    type: 'Consultation', // Same type as id: '1' for history
    ...transformServiceData('11:00 - 12:30 15/04/2025', '€75.00', 'Main Office, Room B', 'Myra Jaafar'),
    status: 'Active', // Example: another past active consultation
    statusColor: 'text-green-500',
  },
];