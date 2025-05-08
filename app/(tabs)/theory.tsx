import { SafeAreaView } from 'react-native-safe-area-context';
import TestScreen from '../TheoryTesting/TestScreen';

export default function Theory() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <TestScreen />
    </SafeAreaView>
  );
}