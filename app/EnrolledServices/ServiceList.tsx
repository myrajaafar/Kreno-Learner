import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';

const servicesData = [
  { id: '1', type: 'Service type', time: '17:00 - 14:30 25/05/2025', status: 'Active', statusColor: 'text-green-500' },
  { id: '2', type: 'Service type', time: '17:00 - 14:30 25/05/2025', status: 'Pending', statusColor: 'text-orange-500' },
];

const ServicesList = () => {
  const renderService = ({ item }) => (
    <View className="bg-gray-100 rounded-lg p-4 mb-4 mx-4 flex-row justify-between items-center">
      <View>
        <Text className="text-gray-800">{item.type}</Text>
        <Text className="text-gray-600 text-sm">{item.time}</Text>
        <Text className={`${item.statusColor} text-sm`}>{item.status} ⬤</Text>
      </View>
      <TouchableOpacity onPress={() => router.push(`/service-details/${item.id}`)}>
        <Text className="text-orange-500">Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white ">
      <Text className="text-2xl px-4 font-cbold mb-3 text-gray-800">Services</Text>
      <FlatList
        data={servicesData}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        className="flex-1"
      />
    </View>
  );
};

export default ServicesList;