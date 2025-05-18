import { View, Text, ScrollView, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../components/CategoryCard';
import { testCategoriesData } from '../../constants/TestCategories';
import CustomHeader from '../../components/CustomHeader';
import { router } from 'expo-router';

export default function Theory() {
  return (
    <View className='flex-1 bg-white'>
      <CustomHeader />
      <ScrollView 
        className='pt-3 px-4'
      >
        <View>
          <Text className="text-2xl font-cbold pb-10 text-gray-800">
            Pick a Category
          </Text>
          {testCategoriesData.map((category) => (
            <CategoryCard
              key={category.id}
              iconName={category.mciIconName}
              title={category.title}
              description={category.description}
              onPress={() => router.push({ pathname: '../TheoryTesting/TheoryTestScreen', params: { category: category.title } })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}