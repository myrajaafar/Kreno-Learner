import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

const Dashboard = () => (
  <View className="flex-1 bg-white">
    <Text className="text-lg font-bold p-4">Dashboard</Text>
    <Button title="settings" onPress={() => router.replace("/Settings/SettingScreen")} />
  </View>
);

export default Dashboard;