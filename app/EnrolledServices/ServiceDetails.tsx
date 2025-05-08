import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const ServiceDetails = () => {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 bg-white">
      <Text className="text-lg font-bold p-4">Service Details - ID: {id}</Text>
    </View>
  );
};

export default ServiceDetails;