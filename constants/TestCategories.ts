export interface TestCategory {
  id: string;
  iconKey: string; // Changed from iconPlaceholder, will be a simple key
  title: string;
  description: string;
}

export const testCategoriesData: TestCategory[] = [
  {
    id: '1',
    iconKey: 'road', // Use simple keys like 'road', 'cone', etc.
    title: 'Road and Traffic Signs',
    description: 'Common and uncommon signs for rules and information; limits and parking',
  },
  {
    id: '2',
    iconKey: 'cone',
    title: 'Incidents, Accidents, Emergencies',
    description: 'Staying safe if you break down, dealing with accidents and emergencies',
  },
  {
    id: '3',
    iconKey: 'car',
    title: 'Vehicle Handling',
    description: 'Driving on slippery roads, and in challenging conditions such as rain and snow',
  },
  {
    id: '4',
    iconKey: 'highway',
    title: 'Motorway Rules',
    description: 'Driving on a motorway - rules, limits, safety, emergency procedures, roadworks and riding guidelines',
  },
  {
    id: '5',
    iconKey: 'seatbelt',
    title: 'Safety Margins',
    description: 'Braking, accelerating, overtaking and manoeuvring safely under all driving conditions',
  },
  {
    id: '6',
    iconKey: 'generaltest',
    title: 'General Test',
    description: 'description',
  },
];