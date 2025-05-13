import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
const Dashboard = () => (
  <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
    <CustomHeader 
      showSettingsIcon={true} 
      onSettingsPress={() => router.push("/Settings/SettingScreen")} 
    />
    <View className='px-4'>
      <Text className="text-2xl font-cbold mb-3 text-gray-800">Dashboard</Text>
    </View>
  </SafeAreaView>
);

export default Dashboard;