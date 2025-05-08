import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

const SettingScreen = () => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => router.replace('/login') },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-lg font-bold mb-4">Settings</Text>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4"
          onPress={() => router.push('/account-modification')}
        >
          <Text>Modify Account</Text>
          <Text className="text-orange-500">→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4"
          onPress={handleLogout}
        >
          <Text>Logout</Text>
          <Text className="text-orange-500">→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingScreen;