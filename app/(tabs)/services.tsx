import { SafeAreaView } from 'react-native-safe-area-context';
import ServicesList from '../EnrolledServices/ServiceList';

export default function Services() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ServicesList />
    </SafeAreaView>
  );
}