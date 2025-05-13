import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'; // Added ImageSourcePropType


interface CategoryCardProps {
  iconSource: ImageSourcePropType; // Changed from iconPlaceholder: string
  title: string;
  description: string;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ iconSource, title, description, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-100 p-4 rounded-2xl mb-4 flex-row items-center shadow-sm"
    >
        <Image source={iconSource} className='w-10 h-10 mr-3' resizeMode="contain" /> {/* Use iconSource and added mr-3, resizeMode */}
      <View className="flex-1 ml-1"> {/* Added ml-1 for a bit of space if icon is large */}
        <Text className="text-base font-cbold text-gray-800">{title}</Text>
        <Text className="text-sm font-cregular text-gray-600 mt-1">{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;