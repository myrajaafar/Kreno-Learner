import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface TestCategory {
  id: string;
  mciIconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
}

export const testCategoriesData: TestCategory[] = [
  {
    id: '1',
    title: 'Road Signs',
    description: 'Identify and understand various road signs.',
    mciIconName: 'road-variant',
  },
  {
    id: '2',
    title: 'Hazard Perception',
    description: 'Recognize potential hazards on the road.',
    mciIconName: 'alert-decagram-outline',
  },
  {
    id: '3',
    title: 'Vehicle Safety',
    description: 'Basic checks and safety equipment.',
    mciIconName: 'car-cog',
  },
  {
    id: '4',
    title: 'Highway Code',
    description: 'Rules and regulations for road users.',
    mciIconName: 'book-open-page-variant-outline',
  },
  {
    id: '5',
    title: 'Safety Margins',
    description: 'Safe distances and stopping times.',
    mciIconName: 'arrow-expand-horizontal',
  },
  {
    id: '6',
    title: 'General Test',
    description: 'A mix of all categories.',
    mciIconName: 'clipboard-check-multiple-outline',
  },
];