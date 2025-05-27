import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { router } from 'expo-router';
import LessonCard from '../../components/LessonCard';
import { isPast, parseISO, parse, differenceInDays, format, isSameDay } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/CustomHeader';
import { useAuth } from '../../context/AuthContext';
import { useLessonData, Lesson } from '../../context/LessonContext'; // Import the context
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Define an interface for the structure of a single evaluation object from the DB
interface DBEvaluation {
  evaluation_id: number;
  lesson_id: string;
  user_id: string | null;
  overall_lesson_rating: number;
  evaluation_comment: string | null;
  skill_ratings: Record<string, string>;
  submitted_at: string;
  lesson_title?: string;
  lesson_date?: string;
  lesson_start_time?: string;
  skill_name?: string;
}

// Add this interface near the top with other interfaces
interface ApiSubSkill {
  sub_skill_id: string;
  skill_id: string;
  sub_skill_name: string;
  subskill_code?: string;
  description: string | null;
}

const DetailRow: React.FC<{ 
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']; 
  label: string; 
  value: string; 
  valueColor?: string; 
  isMultiline?: boolean 
}> = ({ iconName, label, value, valueColor = "text-gray-600", isMultiline = false }) => (
  <View className="mb-3">
    <View className="flex-row items-start">
      <MaterialCommunityIcons name={iconName} size={20} color="#f97316" className="mr-2 mt-0.5" />
      <Text className="text-base font-csemibold text-gray-700 flex-shrink mr-1">{label}:</Text>
    </View>
    <Text className={`text-sm ${valueColor} ml-7 ${isMultiline ? 'mt-1' : 'mt-0'}`}>{value}</Text>
  </View>
);

const EvaluationCard: React.FC<{ evaluation: DBEvaluation; onPress: () => void; lessons: Lesson[] }> = ({ evaluation, onPress, lessons }) => {
  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color={star <= rating ? '#FFD700' : '#CBD5E1'}
          />
        ))}
      </View>
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const isEditable = () => {
    try {
      const submissionDate = new Date(evaluation.submitted_at);
      const daysDifference = differenceInDays(new Date(), submissionDate);
      return daysDifference < 3;
    } catch {
      return false;
    }
  };

  // Get lesson details from context
  const lesson = lessons.find(l => l.id === evaluation.lesson_id);
  const lessonTitle = evaluation.lesson_title || lesson?.title || `Lesson ${evaluation.lesson_id}`;
  const lessonDate = evaluation.lesson_date || lesson?.date;
  const lessonTime = evaluation.lesson_start_time || lesson?.startTime;
  const skillName = evaluation.skill_name || lesson?.skillName;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-lg font-csemibold text-gray-800" numberOfLines={1}>
            {lessonTitle}
          </Text>
          {skillName && (
            <Text className="text-sm text-gray-600 mt-0.5">
              {skillName}
            </Text>
          )}
        </View>
        {isEditable() && (
          <View className="bg-orange-100 px-2 py-1 rounded">
            <Text className="text-xs text-orange-600 font-cmedium">Editable</Text>
          </View>
        )}
      </View>

      {/* Date and Rating Row */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {lessonDate ? formatDisplayDate(lessonDate) : 'Date N/A'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600 mr-2">Overall:</Text>
          {renderStars(evaluation.overall_lesson_rating)}
        </View>
      </View>

      {/* Time and Submitted Date */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {lessonTime && lessonTime !== 'N/A' ? lessonTime : 'Time N/A'}
          </Text>
        </View>
        <Text className="text-xs text-gray-500">
          Submitted: {formatDisplayDate(evaluation.submitted_at)}
        </Text>
      </View>

      {/* Comment Preview */}
      {evaluation.evaluation_comment && (
        <View className="mt-2 pt-2 border-t border-gray-100">
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            "{evaluation.evaluation_comment}"
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const EvaluationHistoryList = () => {
  const { currentUser } = useAuth();
  const { lessons: allLessonsFromContext, isLoading: lessonsLoading, fetchCoreData } = useLessonData();
  const [pendingEvaluationLessons, setPendingEvaluationLessons] = useState<Lesson[]>([]);
  const [dbEvaluations, setDbEvaluations] = useState<DBEvaluation[]>([]);
  const [subSkillsMap, setSubSkillsMap] = useState<Record<string, string>>({}); // Map sub-skill ID to name
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<DBEvaluation | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Function to fetch all sub-skills and create a mapping
  const fetchSubSkillsMapping = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.1.51/kreno-api/sub_skills_api.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.sub_skills)) {
        const mapping: Record<string, string> = {};
        result.sub_skills.forEach((subSkill: ApiSubSkill) => {
          mapping[subSkill.sub_skill_id] = subSkill.sub_skill_name;
          // Also map by subskill_code if it exists (for evaluations that use codes as keys)
          if (subSkill.subskill_code) {
            mapping[subSkill.subskill_code] = subSkill.sub_skill_name;
          }
        });
        setSubSkillsMap(mapping);
      }
    } catch (error) {
      console.error('Error fetching sub-skills mapping:', error);
    }
  }, []);

  // Remove fetchAndProcessApiLessons since we're using LessonContext
  const processPendingEvaluations = useCallback(() => {
    const pending: Lesson[] = [];
    allLessonsFromContext.forEach(lesson => {
      if (lesson.date && lesson.startTime && lesson.startTime !== 'N/A' && !lesson.EvaluationGiven) {
        try {
          const lessonDateTimeString = `${lesson.date}T${lesson.startTime}:00`;
          const lessonDateTime = parseISO(lessonDateTimeString);

          // A lesson is pending evaluation if its time has passed and EvaluationGiven is false
          if (isPast(lessonDateTime)) {
            pending.push(lesson);
          }
        } catch (error) {
          console.warn(`Invalid date format for lesson ID ${lesson.id}: ${lesson.date}T${lesson.startTime}`, error);
        }
      }
    });

    pending.sort((a, b) => {
      try {
        const dateTimeA = parseISO(`${a.date}T${a.startTime}:00`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}:00`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // Most recent past lessons first
      } catch {
        return 0;
      }
    });
    setPendingEvaluationLessons(pending);
  }, [allLessonsFromContext]);

  // Update processPendingEvaluations when lessons change
  useEffect(() => {
    processPendingEvaluations();
  }, [processPendingEvaluations]);

  const fetchEvaluationHistory = useCallback(async () => {
    if (!currentUser?.userId) {
      setFetchError("User not authenticated. Cannot fetch evaluation history.");
      setDbEvaluations([]);
      return;
    }
    setFetchError(null);
    try {
      const response = await fetch(`http://192.168.1.51/kreno-api/evaluations_api.php?userId=${currentUser.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.evaluations)) {
        setDbEvaluations(result.evaluations);
      } else {
        if (result.success && result.count === 0) {
          setDbEvaluations([]);
        } else {
          throw new Error(result.message || 'Failed to fetch evaluation history data or data is not in expected format.');
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while fetching history.';
      console.error('Fetch evaluation history error:', errorMessage);
      setFetchError(errorMessage);
    }
  }, [currentUser?.userId]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setFetchError(null);
    
    // Use fetchCoreData from LessonContext instead of local fetch
    await Promise.all([
      fetchCoreData(isRefresh, currentUser?.userId),
      fetchEvaluationHistory(),
      fetchSubSkillsMapping() // Add this to load sub-skills mapping
    ]);
    
    if (!isRefresh) setIsLoading(false);
  }, [fetchCoreData, fetchEvaluationHistory, fetchSubSkillsMapping, currentUser?.userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
  }, [loadData]);

  const getLessonTitle = (lessonId: string): string => {
    const foundLesson = allLessonsFromContext.find(l => l.id === lessonId);
    return foundLesson?.title || `Lesson ID: ${lessonId}`;
  };

  const isEditableEvaluation = (submittedAt: string): boolean => {
    try {
      const submissionDate = new Date(submittedAt);
      const daysDifference = differenceInDays(new Date(), submissionDate);
      return daysDifference < 3;
    } catch {
      return false;
    }
  };

  const handleCardPress = (evaluation: DBEvaluation) => {
    setSelectedEvaluation(evaluation);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedEvaluation(null);
  };

  const handleEditEvaluation = (evaluation: DBEvaluation) => {
    setIsModalVisible(false);
    router.push({
      pathname: '/Evaluation/EvaluationForm',
      params: {
        lessonId: evaluation.lesson_id,
        lessonTitle: evaluation.lesson_title,
        editMode: 'true',
        evaluationId: evaluation.evaluation_id.toString(),
      }
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFD700' : '#CBD5E1'}
          />
        ))}
      </View>
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Pending lessons logic (show only 3 oldest)
  const oldestPendingLessons = useMemo(() => {
    const pending: Lesson[] = [];
    allLessonsFromContext.forEach(lesson => {
      if (lesson.date && lesson.startTime && lesson.startTime !== 'N/A' && !lesson.EvaluationGiven) {
        try {
          const lessonDateTimeString = `${lesson.date}T${lesson.startTime}:00`;
          const lessonDateTime = parseISO(lessonDateTimeString);
          if (isPast(lessonDateTime)) {
            pending.push(lesson);
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    });
    pending.sort((a, b) => {
      try {
        const dateTimeA = parseISO(`${a.date}T${a.startTime}:00`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}:00`);
        return dateTimeA.getTime() - dateTimeB.getTime(); // oldest first
      } catch {
        return 0;
      }
    });
    return pending.slice(0, 3);
  }, [allLessonsFromContext]);


  // Helper to normalize MM DD YYYY (e.g., "5 8 2024" -> "05 08 2024")
  const normalizeDate = (dateStr: string) => {
    const [mm, dd, yyyy] = dateStr.trim().split(' ');
    if (!mm || !dd || !yyyy) return dateStr;
    return `${mm.padStart(2, '0')} ${dd.padStart(2, '0')} ${yyyy}`;
  };

  const filteredEvaluations = selectedDate
  ? dbEvaluations.filter(e => {
      if (!e.submitted_at) return false;
      const parsed = parseISO(e.submitted_at);
      return isSameDay(parsed, selectedDate);
    })
  : dbEvaluations;

  if (isLoading || lessonsLoading) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader showSettingsIcon={false} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fb923c" />
          <Text className="mt-2 text-gray-600">Loading evaluations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader showSettingsIcon={false} />
      
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#fb923c"]}
            tintColor={"#fb923c"}
          />
        }
      >
        <View className="pt-3 px-4 pb-5">
          <Text className="text-2xl font-cbold mb-5 text-gray-800">Pending Evaluations</Text>
          {/* Pending Evaluation Section */}
          {oldestPendingLessons.length > 0 && (
            <View className="mb-6">
              {oldestPendingLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onPressAction={() =>
                    router.push({
                      pathname: '/Evaluation/EvaluationForm',
                      params: {
                        lessonId: lesson.id,
                        lessonTitle: lesson.title,
                      }
                    })
                  }
                />
              ))}
            </View>
          )}
          {/* Date Filter Button */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-cbold text-gray-800">Evaluation History</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className='bg-orange-500 rounded-lg p-2 flex-row items-center'
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="font-csemibold text-white m-1">
                  {selectedDate ? format(selectedDate, 'dd - MMMM - yyyy') : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {selectedDate && (
                <TouchableOpacity
                  onPress={() => setSelectedDate(null)}
                  className="ml-2"
                  accessibilityLabel="Clear date filter"
                >
                  <MaterialCommunityIcons name="close-circle" size={26} color="#f97316" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Evaluation History List */}
          {filteredEvaluations.length === 0 ? (
            <View className="items-center justify-center p-8 bg-white rounded-lg">
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#9ca3af" />
              <Text className="text-center text-gray-500 mt-4 text-lg">No evaluations found</Text>
              <Text className="text-center text-gray-400 mt-1">Complete some lessons to see your evaluations here</Text>
            </View>
          ) : (
            filteredEvaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.evaluation_id}
                evaluation={evaluation}
                lessons={allLessonsFromContext}
                onPress={() => handleCardPress(evaluation)}
              />
            )))
          }
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setShowDatePicker(false);
          setSelectedDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Evaluation Detail Modal */}
      {selectedEvaluation && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={handleCloseModal}
        >
          <View className='flex-1 justify-center items-center bg-[rgba(0,0,0,0.55)]'>
            <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md relative">
              <View className="flex-row justify-between items-center pb-3 mb-4 border-b border-gray-200">
                <View className="flex-1 mr-2">
                  <Text className="text-xl font-cbold text-gray-800" numberOfLines={1}>
                    {selectedEvaluation.lesson_title || 
                     allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.title || 
                     `Lesson ${selectedEvaluation.lesson_id}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleCloseModal} className="p-1 -mr-2 -mt-2">
                  <MaterialCommunityIcons name="close-circle-outline" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {/* Lesson Details - use context data as fallback */}
                {(selectedEvaluation.lesson_date || allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.date) && (
                  <DetailRow
                    iconName="calendar-blank-outline"
                    label="Lesson Date"
                    value={formatDisplayDate(
                      selectedEvaluation.lesson_date || 
                      allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.date || ''
                    )}
                  />
                )}
                {(selectedEvaluation.lesson_start_time || allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.startTime) && (
                  <DetailRow
                    iconName="clock-outline"
                    label="Lesson Time"
                    value={selectedEvaluation.lesson_start_time || 
                           allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.startTime || 'N/A'}
                  />
                )}
                {(selectedEvaluation.skill_name || allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.skillName) && (
                  <DetailRow
                    iconName="lightbulb-on-outline"
                    label="Skill Focus"
                    value={selectedEvaluation.skill_name || 
                           allLessonsFromContext.find(l => l.id === selectedEvaluation.lesson_id)?.skillName || ''}
                  />
                )}

                {/* Evaluation Details */}
                <DetailRow
                  iconName="calendar-check-outline"
                  label="Submitted"
                  value={formatDisplayDate(selectedEvaluation.submitted_at)}
                />

                <View className="mb-3">
                  <View className="flex-row items-start">
                    <MaterialCommunityIcons name="star-outline" size={20} color="#f97316" className="mr-2 mt-0.5" />
                    <Text className="text-base font-csemibold text-gray-700 flex-shrink mr-1">Overall Rating:</Text>
                  </View>
                  <View className="ml-7">
                    {renderStars(selectedEvaluation.overall_lesson_rating)}
                  </View>
                </View>

                {selectedEvaluation.evaluation_comment && (
                  <DetailRow
                    iconName="comment-text-outline"
                    label="Comments"
                    value={selectedEvaluation.evaluation_comment}
                    isMultiline={true}
                  />
                )}

                {/* Sub-skill Ratings - Updated to show names instead of IDs */}
                {Object.keys(selectedEvaluation.skill_ratings).length > 0 && (
                  <View className="mb-3">
                    <View className="flex-row items-start mb-2">
                      <MaterialCommunityIcons name="format-list-checks" size={20} color="#f97316" className="mr-2 mt-0.5" />
                      <Text className="text-base font-csemibold text-gray-700">Sub-skill Ratings:</Text>
                    </View>
                    <View className="ml-7">
                      {Object.entries(selectedEvaluation.skill_ratings).map(([skillId, rating]) => {
                        // Get the sub-skill name from the mapping, fallback to ID if not found
                        const skillName = subSkillsMap[skillId] || skillId;
                        return (
                          <View key={skillId} className="flex-row justify-between items-center mb-1 py-1">
                            <Text className="text-sm text-gray-600 flex-1 mr-2">{skillName}:</Text>
                            <Text className="text-sm text-gray-700 font-cmedium">{rating}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Edit button and info */}
                {isEditableEvaluation(selectedEvaluation.submitted_at) ? (
                  <View className="mt-4 pt-4 border-t border-gray-200">
                    <TouchableOpacity
                      onPress={() => handleEditEvaluation(selectedEvaluation)}
                      className="bg-blue-500 px-4 py-3 rounded-lg flex-row items-center justify-center"
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="white" />
                      <Text className="text-white font-cmedium ml-2">Edit Evaluation</Text>
                    </TouchableOpacity>
                    <Text className="text-xs text-blue-600 mt-2 text-center">
                      ⏰ Can be edited for {3 - differenceInDays(new Date(), new Date(selectedEvaluation.submitted_at))} more day(s)
                    </Text>
                  </View>
                ) : (
                  <View className="mt-4 pt-4 border-t border-gray-200">
                    <View className="bg-gray-100 px-4 py-3 rounded-lg">
                      <Text className="text-gray-500 text-center text-sm">
                        Edit period expired (more than 3 days old)
                      </Text>
                    </View>
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

export default EvaluationHistoryList;