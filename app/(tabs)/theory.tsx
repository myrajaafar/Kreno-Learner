import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import CategoryCard from '../../components/CategoryCard';
import { testCategoriesData } from '../../constants/TestCategories';
import CustomHeader from '../../components/CustomHeader';
import { router } from 'expo-router';
import { useLessonData } from '../../context/LessonContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Map your skill names to appropriate MaterialCommunityIcons
const skillIconMap: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  'highway merging': 'highway',
  'intersection navigation': 'sign-direction',
  'observation skills': 'eye-outline',
  'parallel parking': 'car-parking-lights',
  'vehicle control': 'steering',
};

export default function Theory() {
  const { skills, isLoading: skillsLoading } = useLessonData();

  // General test category (mix of everything)
  const generalCategory = {
    id: 'general',
    mciIconName: 'book-open-variant' as const,
    title: 'General',
    description: 'A mix of all categories.',
  };

  return (
    <View className='flex-1 bg-white'>
      <CustomHeader />
      <ScrollView className='pt-3 px-4'>
        <View>
          <Text className="text-2xl font-cbold pb-10 text-gray-800">
            Pick a Category
          </Text>
          {!skillsLoading && skills.map((skill) => (
            <CategoryCard
              key={skill.skill_id}
              iconName={
                  skillIconMap[skill.skill_name.toLowerCase()] ||
                  'star-outline'
              }
              title={skill.skill_name}
              description={skill.description || ''}
              onPress={() =>
                router.push({
                  pathname: '../TheoryTesting/TheoryTestScreen',
                  params: { category: skill.skill_name, skillId: skill.skill_id },
                })
              }
            />
          ))}
          <CategoryCard
            key={generalCategory.id}
            iconName={generalCategory.mciIconName}
            title={generalCategory.title}
            description={generalCategory.description}
            onPress={() =>
              router.push({
                pathname: '../TheoryTesting/TheoryTestScreen',
                params: { category: generalCategory.title },
              })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}