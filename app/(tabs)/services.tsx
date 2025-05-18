import { View } from 'react-native';
import ServicesList from '../EnrolledServices/ServiceList';
import CustomHeader from '../../components/CustomHeader';


export default function Services() {
  return (
    <View className='flex-1 bg-white'>
      <CustomHeader />
      <ServicesList />
    </View>
  );
}