import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView } from 'react-native'; // Added Modal, StyleSheet, ScrollView
import { servicesData, Service } from '../../data/servicesData';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define DetailRow directly in this file
const DetailRow: React.FC<{ iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string; valueColor?: string; isMultiline?: boolean }> = 
({ iconName, label, value, valueColor = "text-gray-600", isMultiline = false }) => (
  <View className="mb-3">
    <View className="flex-row items-start">
      <MaterialCommunityIcons name={iconName} size={20} color="#f97316" className="mr-2 mt-0.5" />
      <Text className="text-base font-csemibold text-gray-700 flex-shrink mr-1">{label}:</Text>
    </View>
    <Text className={`text-sm ${valueColor} ml-8 ${isMultiline ? 'mt-1' : 'mt-0'}`}>{value}</Text>
  </View>
);

const ServicesList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentServiceHistory, setCurrentServiceHistory] = useState<{ date: string; status: string }[]>([]);

  const getStatusIcon = (status: string) => {
    if (status === 'Active') {
      return <MaterialCommunityIcons name="check-circle-outline" size={13} color="#22c55e" />;
    } else if (status === 'Pending') {
      return <MaterialCommunityIcons name="clock-outline" size={13} color="orange" />;
    }
    return null;
  };

  const handleCardPress = (item: Service) => {
    const history = servicesData
      .filter(service => service.type === item.type && service.id !== item.id)
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
      .map(histItem => ({ date: histItem.displayDate, status: histItem.status }));
    
    setSelectedService(item);
    setCurrentServiceHistory(history);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedService(null);
    setCurrentServiceHistory([]);
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(item)}
      className="bg-white rounded-lg p-4 mb-3 mx-4 shadow border border-gray-300 active:bg-gray-100"
    >
      <View className="flex-row justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-base text-gray-800 font-cbold mb-1">{item.type}</Text>
          <View className="flex-row items-center">
            <Text className={`text-xs ${item.statusColor} font-cbold mr-1`}>{item.status}</Text>
            {getStatusIcon(item.status)}
          </View>
        </View>
        <View className="items-end justify-between">
          <Text className="text-xs font-cregular text-gray-500">{item.displayTimeRange}</Text>
          <Text className="text-xs font-cregular text-gray-500 mb-1">{item.displayDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 pt-3">
      <Text className="text-2xl px-4 font-cbold mb-4 text-gray-800">Services</Text>
      <FlatList
        data={servicesData}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        className="flex-1 pt-4"
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      {selectedService && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={handleCloseModal}
        >
          <View className='bg-[#000000aa] flex-1 justify-center items-center'>
            <View className="bg-white p-5 pt-4 rounded-lg shadow-xl w-11/12 max-w-lg">
              <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-gray-200">
                <Text className="text-xl font-cbold text-gray-800" numberOfLines={1}>{selectedService.type}</Text>
                <TouchableOpacity onPress={handleCloseModal} className="p-1 -mr-2 -mt-1">
                  <MaterialCommunityIcons name="close-circle-outline" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <DetailRow iconName="account-circle-outline" label="Client" value={selectedService.userName} />
                <DetailRow iconName="tag-outline" label="Service" value={selectedService.type} />
                <DetailRow iconName="calendar-month-outline" label="Date" value={selectedService.displayDate} />
                <DetailRow iconName="clock-time-four-outline" label="Time" value={selectedService.displayTimeRange} />
                <DetailRow iconName="cash-multiple" label="Price" value={selectedService.price} />
                <DetailRow iconName="map-marker-outline" label="Location" value={selectedService.location} />
                <DetailRow iconName="list-status" label="Status" value={selectedService.status}/>
                
                {currentServiceHistory && currentServiceHistory.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <View className="flex-row items-center mb-1">
                        <MaterialCommunityIcons name="history" size={20} color="#4A5568" className="mr-2" />
                        <Text className="text-base font-csemibold text-gray-700">{selectedService.type} History:</Text>
                    </View>
                    {currentServiceHistory.map((hist, index) => (
                      <Text key={index} className="text-sm text-gray-600 ml-7">
                        - {hist.date}: {hist.status}
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ServicesList;