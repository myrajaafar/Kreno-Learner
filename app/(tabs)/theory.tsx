import { View, Text, ScrollView, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../components/CategoryCard';
import { testCategoriesData } from '../../constants/TestCategories';
import CustomHeader from '../../components/CustomHeader';

type IconKey = 'road' | 'cone' | 'car' | 'highway' | 'seatbelt' | 'generaltest';

const localIcons: Record<IconKey, ImageSourcePropType> = {
  'road': require('../../assets/icons/road.png'),
  'cone': require('../../assets/icons/cone.png'),
  'car': require('../../assets/icons/car.png'),
  'highway': require('../../assets/icons/highway.png'),
  'seatbelt': require('../../assets/icons/seatbelt.png'),
  'generaltest': require('../../assets/icons/generaltest.png'),
};

export default function Theory() {
  return (
    <SafeAreaView className='flex-1 bg-white' edges={['top', 'left', 'right']}>
      <CustomHeader />
      <ScrollView 
        className='flex-1 px-4'
      >
        <View>
          <Text className="text-2xl font-cbold pb-10 text-gray-800">
            Pick a Category
          </Text>
          {testCategoriesData.map((category) => (
            <CategoryCard
              key={category.id}
              iconSource={localIcons[category.iconKey as IconKey]}
              title={category.title}
              description={category.description}
              onPress={() => console.log('Pressed:', category.title)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}