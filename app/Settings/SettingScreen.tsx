import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader />
      <View className="pt-3">
        <Text className="px-4 text-2xl font-cbold mb-4">Settings</Text>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => router.push('/Settings/AccountModification')} // Verify this path
        >
          <Text className='font-cregular text-lg text-gray-700'>Modify Account</Text>
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => router.push('/Settings/AboutScreen')}
        >
          <Text className='font-cregular text-lg text-gray-700'>About</Text>
          <MaterialCommunityIcons name="information-outline" size={24} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4"
          onPress={handleLogout}
        >
          <Text className='font-cregular text-lg text-gray-700'>Logout</Text>
          <MaterialCommunityIcons name="logout" size={24} color="#f97316" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingScreen;