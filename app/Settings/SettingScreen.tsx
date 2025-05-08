import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
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
        <Text className="text-lg font-cbold mb-4">Settings</Text>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4"
          onPress={() => router.replace('../(tabs)/dashboard')}
        />
        <TouchableOpacity
          className="flex-row justify-between items-center p-4"
          onPress={() => router.push('/account-modification')}
        >
          <Text className='font-cregular'>Modify Account</Text>
          <Image source={require("../../assets/icons/edit-icon.png")} resizeMode="cover" className="w-5 h-5"/>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row justify-between items-center p-4"
          onPress={handleLogout}
        >
          <Text className='font-cregular'>Logout</Text>
          <Image source={require("../../assets/icons/logout-icon.png")} resizeMode="cover" className="w-5 h-5"/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingScreen;