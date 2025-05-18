import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { testCategoriesData, TestCategory } from '../../constants/TestCategories';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define the icon rating levels and their corresponding descriptive values
const ICON_RATINGS = [
  { iconName: 'emoticon-sad-outline', value: 'Very Poor', description: "Needs Significant Improvement", color: '#ef4444' }, // Red
  { iconName: 'emoticon-neutral-outline', value: 'Poor', description: "Needs Improvement", color: '#f97316' }, // Orange
  { iconName: 'emoticon-happy-outline', value: 'Okay', description: "Developing Adequately", color: '#eab308' }, // Yellow
  { iconName: 'emoticon-excited-outline', value: 'Good', description: "Proficient", color: '#22c55e' }, // Green
  { iconName: 'emoticon-cool-outline', value: 'Very Good', description: "Exceeds Expectations", color: '#3b82f6' }, // Blue (already a face icon)
] as const;

type IconRatingValue = typeof ICON_RATINGS[number]['value'];

interface SkillRatings {
  [key: string]: IconRatingValue | '';
}

const IconSkillRating = ({
  currentRating,
  onRate,
}: {
  currentRating: IconRatingValue | '';
  onRate: (rating: IconRatingValue) => void;
}) => {
  return (
    <View className="flex-row justify-around items-center my-2 py-1">
      {ICON_RATINGS.map((level, index) => {
        const isSelected = currentRating === level.value;
        return (
          <View key={level.value} className={`flex-row items-center ${index < ICON_RATINGS.length - 1 ? 'pr-1' : ''}`}>
            <TouchableOpacity
              onPress={() => onRate(level.value)}
              className={`rounded-full items-center justify-center w-10 h-10
                          ${isSelected ? 'bg-slate-200 border-2 border-slate-400' : 'bg-transparent'}
                          `}
              accessibilityLabel={level.description}
            >
              <MaterialCommunityIcons
                name={level.iconName as any}
                size={isSelected ? 30 : 26}
                color={isSelected ? level.color : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};


const FeedbackForm = () => {
  const { lessonId, lessonTitle } = useLocalSearchParams<{ lessonId: string, lessonTitle?: string }>();

  const [skillRatings, setSkillRatings] = useState<SkillRatings>({});
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialRatings: SkillRatings = {};
    testCategoriesData
      .filter(category => category.title !== 'General Test')
      .forEach(category => {
      initialRatings[category.title] = '';
    });
    setSkillRatings(initialRatings);
  }, []);

  const handleSkillRatingChange = (categoryTitle: string, rating: IconRatingValue) => {
    setSkillRatings(prev => ({ ...prev, [categoryTitle]: rating }));
  };

  const handleOverallRating = (rating: number) => {
    setOverallRating(rating);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const unratedSkills = Object.values(skillRatings).some(rating => rating === '');
    if (unratedSkills) {
      Alert.alert('Incomplete Form', 'Please rate all skills using the icons.');
      setIsSubmitting(false);
      return;
    }

    if (overallRating === 0) {
      Alert.alert('Incomplete Form', 'Please provide an overall lesson rating (stars).');
      setIsSubmitting(false);
      return;
    }
    if (comment.trim() === '') {
      Alert.alert('Incomplete Form', 'Please provide a comment.');
      setIsSubmitting(false);
      return;
    }

    const feedbackData = {
      lessonId,
      skillRatings: skillRatings,
      overallRating,
      comment,
      submittedAt: new Date().toISOString(),
    };

    console.log('Submitting Feedback:', feedbackData);

    setTimeout(() => {
        Alert.alert('Success (Simulated)', 'Feedback submitted successfully!');
        if (router.canGoBack()) router.back();
        setIsSubmitting(false);
    }, 1000);
  };

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (rate: number) => void }) => {
    return (
      <View className="flex-row justify-center my-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRate(star)} className="p-1">
            <MaterialCommunityIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? '#FFD700' : '#CBD5E1'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader showSettingsIcon={false} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          <View className="p-4">
            <Text className="text-2xl font-cbold text-gray-800 mb-1">Lesson Feedback</Text>
            {lessonTitle && <Text className="text-lg font-cregular text-gray-600 mb-6">{lessonTitle}</Text>}

            <Text className="text-xl font-csemibold text-gray-700 mb-3">Skill Assessment</Text>
            {testCategoriesData
              .filter(category => category.title !== 'General Test')
              .map((category: TestCategory) => (
              <View key={category.id || category.title} className="mb-4 p-3 bg-slate-50 rounded-lg">
                <Text className="text-base font-cmedium text-gray-700 mb-1.5">{category.title}</Text>
                <IconSkillRating
                  currentRating={skillRatings[category.title] || ''}
                  onRate={(rating) => handleSkillRatingChange(category.title, rating)}
                />
              </View>
            ))}

            <Text className="text-xl font-csemibold text-gray-700 mt-4 mb-1">Overall Lesson Rating</Text>
            <StarRating rating={overallRating} onRate={handleOverallRating} />

            <Text className="text-xl font-csemibold text-gray-700 mt-4 mb-2">Comments</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3 h-32 text-base font-cregular bg-white text-gray-800"
              placeholder="Share your thoughts on the lesson..."
              placeholderTextColor="#9ca3af"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              className={`mt-8 py-3.5 rounded-lg ${isSubmitting ? 'bg-gray-400' : 'bg-orange-500 active:bg-orange-600'}`}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text className="text-white text-center font-cbold text-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FeedbackForm;