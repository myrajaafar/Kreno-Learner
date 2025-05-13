import { View, Text, ScrollView, Image } from 'react-native'; // Added Image for future use
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'; // Adjust path if necessary
import CategoryCard from '../../components/CategoryCard';   // Adjust path if necessary
import { testCategoriesData } from '../../constants/TestCategories'; // Import static data
import { Stack } from 'expo-router';


// Local icon mapping (example - you'll fill this with actual require paths)
// const localIcons: { [key: string]: any } = {
//   'road-sign-icon': require('../../assets/icons/road-sign.png'),
//   'cone-icon': require('../../assets/icons/cone.png'),
//   // ... add all your icon placeholders and their paths
// };

const TestScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ScrollView>
        <View className="px-6 pt-2 pb-4">
          <Text className="text-2xl font-cbold text-gray-800 mb-6">
            Pick a Category
          </Text>
          {testCategoriesData.map((category) => (
            <CategoryCard
              key={category.id}
              // When you have local icons, you'd do something like:
              // icon={<Image source={localIcons[category.iconPlaceholder]} className="w-7 h-7" />}
              // For now, we pass the placeholder string directly as per CategoryCard's updated prop
              iconPlaceholder={category.iconPlaceholder}
              title={category.title}
              description={category.description}
              onPress={() => console.log('Pressed:', category.title)} // Placeholder action
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TestScreen;