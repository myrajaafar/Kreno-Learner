import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLessonData } from '../../context/LessonContext';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO, differenceInDays } from 'date-fns';

const ICON_RATINGS = [
  { iconName: 'emoticon-sad-outline', value: 'Very Poor', description: "Needs Significant Improvement", color: '#ef4444' },
  { iconName: 'emoticon-neutral-outline', value: 'Poor', description: "Needs Improvement", color: '#f97316' },
  { iconName: 'emoticon-happy-outline', value: 'Okay', description: "Developing Adequately", color: '#eab308' },
  { iconName: 'emoticon-excited-outline', value: 'Good', description: "Proficient", color: '#22c55e' },
  { iconName: 'emoticon-cool-outline', value: 'Very Good', description: "Exceeds Expectations", color: '#3b82f6' },
] as const;

type IconRatingValue = typeof ICON_RATINGS[number]['value'];

interface SkillRatings {
  [subskillCode: string]: IconRatingValue | '';
}

interface ApiSubSkill {
  sub_skill_id: string;
  skill_id: string;
  sub_skill_name: string;
  subskill_code?: string;
  description: string | null;
}

interface DBEvaluation {
  evaluation_id: number;
  lesson_id: string;
  user_id: string | null;
  overall_lesson_rating: number;
  evaluation_comment: string | null;
  skill_ratings: Record<string, string>;
  submitted_at: string;
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
  const { lessonId, lessonTitle, editMode, evaluationId } = useLocalSearchParams<{ 
    lessonId: string; 
    lessonTitle?: string;
    editMode?: string;
    evaluationId?: string;
  }>();
  const { lessons: allLessons } = useLessonData();
  const { currentUser } = useAuth();

  // State for sub-skills and edit mode
  const [fetchedSubSkills, setFetchedSubSkills] = useState<ApiSubSkill[]>([]);
  const [isLoadingSubSkills, setIsLoadingSubSkills] = useState(true);
  const [subSkillRatings, setSubSkillRatings] = useState<SkillRatings>({});
  const [overallLessonRating, setOverallLessonRating] = useState(0);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(editMode === 'true');
  const [originalEvaluation, setOriginalEvaluation] = useState<DBEvaluation | null>(null);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);

  // Select the lesson from context using lessonId param
  const currentLesson = useMemo(() => {
    if (!lessonId) return null;
    return allLessons.find((lesson) => String(lesson.id) === lessonId);
  }, [lessonId, allLessons]);

  // Load existing evaluation data if in edit mode
  useEffect(() => {
    if (isEditMode && evaluationId) {
      const loadEvaluationForEdit = async () => {
        setIsLoadingEvaluation(true);
        try {
          
          const response = await fetch(`http://192.168.1.51/kreno-api/evaluations_api.php?evaluationId=${evaluationId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const responseText = await response.text();

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
          }

          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response text that failed to parse:', responseText);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
          }

          
          if (result.success && result.evaluation) {
            const evaluation = result.evaluation;
            setOriginalEvaluation(evaluation);
            
            // Prefill the form with existing data
            setOverallLessonRating(evaluation.overall_lesson_rating);
            setEvaluationComment(evaluation.evaluation_comment || '');
            
            // Check if still within edit window
            const daysDiff = differenceInDays(new Date(), new Date(evaluation.submitted_at));
            if (daysDiff >= 3) {
              Alert.alert('Edit Not Allowed', 'This evaluation can no longer be edited (more than 3 days old)', [
                { text: 'OK', onPress: () => router.back() }
              ]);
              return;
            }
          } else {
            // More detailed error messaging
            const errorMessage = result.message || 'No evaluation data returned from server';
            console.error('API Error:', result);
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('Error loading evaluation:', error);
          
          // More specific error handling
          if (error instanceof Error) {
            if (error.message.includes('HTTP error')) {
              Alert.alert('Network Error', 'Failed to connect to server. Please check your connection and try again.');
            } else if (error.message.includes('JSON Parse error') || error.message.includes('Invalid JSON')) {
              Alert.alert('Server Error', 'The server returned an invalid response. Please check the server logs.');
            } else if (error.message.includes('Evaluation not found')) {
              Alert.alert('Evaluation Not Found', 'The evaluation you\'re trying to edit could not be found.');
            } else {
              Alert.alert('Error', `Failed to load evaluation: ${error.message}`);
            }
          } else {
            Alert.alert('Error', 'An unexpected error occurred while loading the evaluation.');
          }
          
          router.back();
        } finally {
          setIsLoadingEvaluation(false);
        }
      };
      
      loadEvaluationForEdit();
    }
  }, [isEditMode, evaluationId]);

  // Fetch sub-skills based on the lesson's skillId
  useEffect(() => {
    const fetchSubSkills = async () => {
      if (!currentLesson?.skillId) {
        setIsLoadingSubSkills(false);
        return;
      }

      setIsLoadingSubSkills(true);
      try {
        const response = await fetch(`http://192.168.1.51/kreno-api/sub_skills_api.php?skill_id=${currentLesson.skillId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.sub_skills)) {
          setFetchedSubSkills(result.sub_skills);
        } else {
          throw new Error(result.message || 'Failed to fetch sub-skills or invalid data structure.');
        }
      } catch (error) {
        console.error("Failed to fetch sub-skills:", error);
        Alert.alert("Error", error instanceof Error ? error.message : "Could not load sub-skills. Please try again.");
        setFetchedSubSkills([]);
      } finally {
        setIsLoadingSubSkills(false);
      }
    };

    fetchSubSkills();
  }, [currentLesson?.skillId]);

  // Auto-initialize ratings once sub-skills are fetched and evaluation data is loaded
  useEffect(() => {
    if (fetchedSubSkills.length > 0) {
      const initialSubSkillRatings: SkillRatings = {};
      fetchedSubSkills.forEach((subSkill) => {
        const key = subSkill.subskill_code || subSkill.sub_skill_id;
        
        // In edit mode, try to load existing ratings from originalEvaluation
        if (isEditMode && originalEvaluation?.skill_ratings) {
          initialSubSkillRatings[key] = (originalEvaluation.skill_ratings[key] as IconRatingValue) || '';
        } else {
          initialSubSkillRatings[key] = '';
        }
      });
      setSubSkillRatings(initialSubSkillRatings);
    }
  }, [fetchedSubSkills, isEditMode, originalEvaluation]);

  // Use date-fns to format date/time from the lesson
  const displayDate = useMemo(() => {
    if (!currentLesson?.date) return '';
    try {
      return format(parseISO(currentLesson.date), 'EEEE, MMMM d, yyyy');
    } catch {
      return '';
    }
  }, [currentLesson?.date]);

  const displayTime = currentLesson?.startTime || '';
  const displaySkill = currentLesson?.skillName || '';

  const handleSkillRatingChange = (subskillCode: string, rating: IconRatingValue) => {
    setSubSkillRatings((prev) => ({ ...prev, [subskillCode]: rating }));
  };

  const handleOverallLessonRatingChange = (rating: number) => {
    setOverallLessonRating(rating);
  };

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);

    // Check if all sub-skills are rated
    const unratedSubSkills = Object.values(subSkillRatings).some((rating) => rating === '');
    if (unratedSubSkills) {
      Alert.alert('Incomplete Form', 'Please rate all sub-skills using the icons.');
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

    // Check if user is authenticated
    if (!currentUser?.userId) {
      Alert.alert('Authentication Error', 'Please log in to submit evaluation.');
      setIsSubmitting(false);
      return;
    }

    const evaluationData = {
      action: isEditMode ? 'update_evaluation' : 'submit_evaluation',
      ...(isEditMode && { evaluationId }),
      lessonId,
      overallLessonRating,
      skillRatings: subSkillRatings,
      comment: evaluationComment,
      userId: currentUser.userId,
      submittedAt: new Date().toISOString(),
    };

    console.log(`${isEditMode ? 'Updating' : 'Submitting'} Evaluation Data:`, JSON.stringify(evaluationData, null, 2));

    try {
      const response = await fetch('http://192.168.1.51/kreno-api/evaluations_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData),
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - Not valid JSON: ${responseText}`);
        }
        result = { success: false, message: "Received non-JSON success response from server." };
      }

      if (response.ok && result.success) {
        Alert.alert('Success', result.message || `Evaluation ${isEditMode ? 'updated' : 'submitted'} successfully!`);
        if (router.canGoBack()) {
          router.back();
        }
      } else {
        const errorMessage = result.message || `Server error: ${response.status}. Please try again.`;
        Alert.alert('Submission Failed', errorMessage);
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (rate: number) => void }) => (
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

  if (isLoadingEvaluation) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader showSettingsIcon={false} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fb923c" />
          <Text className="mt-2 text-gray-600">Loading evaluation...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pb-4">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader showSettingsIcon={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
          <View className="p-4">
            <Text className="text-2xl font-cbold text-gray-800 mb-1">
              {isEditMode ? 'Edit Evaluation' : 'Lesson Evaluation'}
            </Text>
            {lessonTitle ? (
              <Text className="text-lg font-cregular text-gray-600 mb-2">{lessonTitle}</Text>
            ) : currentLesson?.title ? (
              <Text className="text-lg font-cregular text-gray-600 mb-2">{currentLesson.title}</Text>
            ) : null}

            {/* Show edit warning if in edit mode */}
            {isEditMode && originalEvaluation && (
              <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="text-sm text-blue-800 font-cmedium">
                  📝 Editing evaluation submitted on {new Date(originalEvaluation.submitted_at).toLocaleDateString()}
                </Text>
                <Text className="text-xs text-blue-600 mt-1">
                  Edit window expires {3 - differenceInDays(new Date(), new Date(originalEvaluation.submitted_at))} day(s) from now
                </Text>
              </View>
            )}

            {/* Display date/time/skill at the top */}
            {(displayDate || displayTime || displaySkill) && (
              <View className="mb-4 border-b border-gray-300 pb-3">
                {!!displayDate && (
                  <View className="flex-row items-center mb-1">
                    <MaterialCommunityIcons name="calendar-month-outline" size={16} color="#4b5563" className="mr-1.5" />
                    <Text className="text-sm font-csemibold text-gray-600">
                      Date: {displayDate}
                    </Text>
                  </View>
                )}
                {!!displayTime && (
                  <View className="flex-row items-center mb-1">
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#4b5563" className="mr-1.5" />
                    <Text className="text-sm font-csemibold text-gray-600">
                      Time: {displayTime}
                    </Text>
                  </View>
                )}
                {!!displaySkill && (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="target" size={16} color="#4b5563" className="mr-1.5" />
                    <Text className="text-sm font-csemibold text-gray-600">
                      Focus Skill: {displaySkill}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text className="text-xl font-csemibold text-gray-700 mb-3">Sub-Skill Assessment</Text>
            {isLoadingSubSkills ? (
              <ActivityIndicator size="large" color="#fb923c" className="my-5" />
            ) : fetchedSubSkills.length > 0 ? (
              fetchedSubSkills.map((subSkill: ApiSubSkill) => {
                const key = subSkill.subskill_code || subSkill.sub_skill_id;
                return (
                  <View key={subSkill.sub_skill_id} className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <Text className="text-base font-cmedium text-gray-700 mb-1.5">{subSkill.sub_skill_name}</Text>
                    {subSkill.description && <Text className="text-xs font-cregular text-gray-500 mb-1.5">{subSkill.description}</Text>}
                    <IconSkillRating
                      currentRating={subSkillRatings[key] || ''}
                      onRate={(rating) => handleSkillRatingChange(key, rating)}
                    />
                  </View>
                );
              })
            ) : (
              <Text className="text-sm text-gray-500 my-5 text-center">No sub-skills available to rate for this lesson.</Text>
            )}

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
              className={`mt-8 py-3.5 rounded-lg ${isSubmitting || isLoadingSubSkills ? 'bg-gray-400' : 'bg-orange-500 active:bg-orange-600'}`}
              onPress={handleSubmitEvaluation}
              disabled={isSubmitting || isLoadingSubSkills}
            >
              <Text className="text-white text-center font-cbold text-lg">
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Evaluation' : 'Submit Evaluation')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EvaluationForm;