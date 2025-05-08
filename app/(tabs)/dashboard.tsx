import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Dashboard = () => (
  <SafeAreaView >
      <Text className="text-lg font-bold p-4">Dashboard</Text>
      <Button title="settings" onPress={() => router.replace("/Settings/SettingScreen")} />
  </SafeAreaView>
);

export default Dashboard;