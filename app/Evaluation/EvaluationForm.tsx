import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { testCategoriesData, TestCategory } from '../../constants/TestCategories';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_RATINGS = [
  { iconName: 'emoticon-sad-outline', value: 'Very Poor', description: "Needs Significant Improvement", color: '#ef4444' }, // Red
  { iconName: 'emoticon-neutral-outline', value: 'Poor', description: "Needs Improvement", color: '#f97316' }, // Orange
  { iconName: 'emoticon-happy-outline', value: 'Okay', description: "Developing Adequately", color: '#eab308' }, // Yellow
  { iconName: 'emoticon-excited-outline', value: 'Good', description: "Proficient", color: '#22c55e' }, // Green
  { iconName: 'emoticon-cool-outline', value: 'Very Good', description: "Exceeds Expectations", color: '#3b82f6' }, // Blue
] as const;

type IconRatingValue = typeof ICON_RATINGS[number]['value'];

interface SkillRatings { 
  [key: string]: IconRatingValue | '';
}

const INSTRUCTOR_RATING_CATEGORIES = [
  { id: 'comm', title: 'Communication & Clarity' },
  { id: 'pat', title: 'Patience & Supportiveness' },
  { id: 'prof', title: 'Professionalism & Attitude' },
  { id: 'punct', title: 'Punctuality & Preparedness' },
] as const;


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


const EvaluationForm = () => {
  const { lessonId, lessonTitle } = useLocalSearchParams<{ lessonId: string, lessonTitle?: string }>();

  const [skillRatings, setSkillRatings] = useState<SkillRatings>({});
  const [instructorRatings, setInstructorRatings] = useState<SkillRatings>({});
  const [overallLessonRating, setOverallLessonRating] = useState(0);
  const [evaluationComment, setEvaluationComment] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialSkillRatings: SkillRatings = {};
    testCategoriesData
      .filter(category => category.title !== 'General Test')
      .forEach(category => {
      initialSkillRatings[category.title] = '';
    });
    setSkillRatings(initialSkillRatings);

    const initialInstructorRatings: SkillRatings = {};
    INSTRUCTOR_RATING_CATEGORIES.forEach(category => {
      initialInstructorRatings[category.title] = '';
    });
    setInstructorRatings(initialInstructorRatings);

  }, []);

  const handleSkillRatingChange = (categoryTitle: string, rating: IconRatingValue) => {
    setSkillRatings(prev => ({ ...prev, [categoryTitle]: rating }));
  };

  const handleInstructorRatingChange = (categoryTitle: string, rating: IconRatingValue) => {
    setInstructorRatings(prev => ({ ...prev, [categoryTitle]: rating }));
  };

  const handleOverallLessonRatingChange = (rating: number) => {
    setOverallLessonRating(rating);
  };

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);

    // --- Start: Validation (remains the same) ---
    const unratedSkills = Object.values(skillRatings).some(rating => rating === '');
    if (unratedSkills) {
      Alert.alert('Incomplete Form', 'Please rate all skills using the icons.');
      setIsSubmitting(false);
      return;
    }

    const unratedInstructorCategories = Object.values(instructorRatings).some(rating => rating === '');
    if (unratedInstructorCategories) {
      Alert.alert('Incomplete Form', 'Please rate all instructor categories using the icons.');
      setIsSubmitting(false);
      return;
    }

    if (overallLessonRating === 0) {
      Alert.alert('Incomplete Form', 'Please provide an overall lesson rating (stars).');
      setIsSubmitting(false);
      return;
    }
    if (evaluationComment.trim() === '') {
      Alert.alert('Incomplete Form', 'Please provide a comment for the evaluation.');
      setIsSubmitting(false);
      return;
    }
    // --- End: Validation ---

    // Remove userId from here
    const evaluationData = {
      lessonId,
      // userId: userId, // REMOVED
      skillRatings: skillRatings,
      instructorRatings: instructorRatings,
      overallLessonRating,
      comment: evaluationComment,
      submittedAt: new Date().toISOString(),
    };

    console.log('Submitting Evaluation (without userId):', evaluationData);

    try {
      // Ensure this URL points to your PHP script
      const response = await fetch('http://192.168.1.51/kreno-api/submit_evaluation.php', { // ADJUST URL AS NEEDED
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Submission successful:', result);

      if (result.success) {
        Alert.alert('Success', result.message || 'Evaluation submitted successfully!');
        if (router.canGoBack()) {
          router.back();
        }
      } else {
        Alert.alert('Submission Failed', result.message || 'Could not submit evaluation.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
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
    <View className="flex-1 bg-white pb-4">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader showSettingsIcon={false} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          <View className="p-4">
            <Text className="text-2xl font-cbold text-gray-800 mb-1">Lesson Evaluation</Text>
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

            <Text className="text-xl font-csemibold text-gray-700 mt-4 mb-3">Instructor Rating</Text>
            {INSTRUCTOR_RATING_CATEGORIES.map((category) => (
              <View key={category.id} className="mb-4 p-3 bg-slate-50 rounded-lg">
                <Text className="text-base font-cmedium text-gray-700 mb-1.5">{category.title}</Text>
                <IconSkillRating
                  currentRating={instructorRatings[category.title] || ''}
                  onRate={(rating) => handleInstructorRatingChange(category.title, rating)}
                />
              </View>
            ))}

            <Text className="text-xl font-csemibold text-gray-700 mt-4 mb-1">Overall Lesson Rating</Text>
            <StarRating rating={overallLessonRating} onRate={handleOverallLessonRatingChange} />

            <Text className="text-xl font-csemibold text-gray-700 mt-4 mb-2">Comments</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3 h-32 text-base font-cregular bg-white text-gray-800"
              placeholder="Share your thoughts on the lesson evaluation..." 
              placeholderTextColor="#9ca3af"
              value={evaluationComment}
              onChangeText={setEvaluationComment}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              className={`mt-8 py-3.5 rounded-lg ${isSubmitting ? 'bg-gray-400' : 'bg-orange-500 active:bg-orange-600'}`}
              onPress={handleSubmitEvaluation}
              disabled={isSubmitting}
            >
              <Text className="text-white text-center font-cbold text-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EvaluationForm;