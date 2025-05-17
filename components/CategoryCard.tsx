import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import MaterialCommunityIcons

interface CategoryCardProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']; // Changed from iconSource
  title: string;
  description: string;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ iconName, title, description, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-slate-100 rounded-xl p-5 mb-4 flex-row items-center shadow-sm active:bg-slate-200"
    >
      <View className="mr-4 rounded-full">
        {/* Use MaterialCommunityIcons */}
        <MaterialCommunityIcons name={iconName} size={30} color="#9ca3af" /> 
        {/* Adjust size and color as needed */}
      </View>
      <View className="flex-1">
        <Text className="text-lg font-cbold text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-600 font-cregular mt-1" numberOfLines={2}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );
};

export default CategoryCard;