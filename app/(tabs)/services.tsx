import { SafeAreaView } from 'react-native-safe-area-context';
import ServicesList from '../EnrolledServices/ServiceList';
import CustomHeader from '../../components/CustomHeader';


export default function Services() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <CustomHeader />
      <ServicesList />
    </SafeAreaView>
  );
}