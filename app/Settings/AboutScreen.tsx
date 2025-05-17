import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader'; // Assuming you want the same header
import { Stack } from 'expo-router';

const AboutScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader showSettingsIcon={false} /> 
      {/* Or configure header as needed, e.g., with a back button if CustomHeader supports it */}
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-cbold text-gray-800 mb-6">About Kreno</Text>
        
        <View className="mb-4">
          <Text className="text-lg font-csemibold text-gray-700 mb-1">Version</Text>
          <Text className="text-base font-cregular text-gray-600">1.0.0</Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-csemibold text-gray-700 mb-1">Description</Text>
          <Text className="text-base font-cregular text-gray-600 leading-relaxed">
            Kreno is your comprehensive companion for managing driving lessons, tracking progress, 
            and preparing for your theory test. Our goal is to make your journey to getting a 
            driver's license as smooth and efficient as possible.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-csemibold text-gray-700 mb-1">Developed By</Text>
          <Text className="text-base font-cregular text-gray-600">Kreno Development Team</Text>
        </View>

        <View>
          <Text className="text-lg font-csemibold text-gray-700 mb-1">Contact Us</Text>
          <Text className="text-base font-cregular text-gray-600">support@krenoapp.com</Text>
        </View>
        
        {/* Add more sections as needed, e.g., Terms of Service, Privacy Policy links */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;