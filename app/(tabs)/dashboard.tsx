import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';


const firstName = 'Myra';
const lastName = 'Jaafar';

const PROFILE_PIC_URL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=BDBDBD&color=fff`;
const Dashboard = () => (
  <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <CustomHeader />
      <Text className="text-lg font-bold p-4">Dashboard</Text>
      <Button title="settings" onPress={() => router.push("/Settings/SettingScreen")} />
  </SafeAreaView>
);

export default Dashboard;