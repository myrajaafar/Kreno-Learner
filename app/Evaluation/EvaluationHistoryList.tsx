import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'; // Added RefreshControl
import { Stack, router } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context'; // SafeAreaView not used directly here, CustomHeader handles it
import { lessons, Lesson } from '../../constants/Lessons';
import LessonCard from '../../components/LessonCard';
import { isPast, parseISO, startOfDay } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/CustomHeader';

// Define an interface for the structure of a single evaluation object from the DB
interface DBEvaluation {
  evaluation_id: number;
  lesson_id: string;
  user_id: string | null;
  overall_lesson_rating: number;
  evaluation_comment: string | null;
  skill_ratings_json: string; // Will be a JSON string
  instructor_ratings_json: string; // Will be a JSON string
  submitted_at: string;
}

const EvaluationHistoryList = () => {
  const [pendingEvaluationLessons, setPendingEvaluationLessons] = useState<Lesson[]>([]);
  // const [completedEvaluationLessons, setCompletedEvaluationLessons] = useState<Lesson[]>([]); // This will be replaced by dbEvaluations
  const [dbEvaluations, setDbEvaluations] = useState<DBEvaluation[]>([]); // State for fetched evaluations
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // For pull-to-refresh
  const [fetchError, setFetchError] = useState<string | null>(null); // State for fetch errors

  const processLocalLessonsForPending = useCallback(() => {
    // This part remains for "Pending Evaluations" based on local data
    const today = startOfDay(new Date());
    const pending: Lesson[] = [];

    lessons.forEach(lesson => {
      if (lesson.date && lesson.startTime) {
        const lessonDateTimeString = `${lesson.date}T${lesson.startTime}`;
        try {
          const lessonDateTime = parseISO(lessonDateTimeString);
          if (lesson.status === 'completed' && !lesson.EvaluationGiven && isPast(lessonDateTime)) {
            pending.push(lesson);
          }
        } catch (error) {
          console.warn(`Invalid date format for lesson ID ${lesson.id} in processLocalLessonsForPending: ${lessonDateTimeString}`, error);
        }
      }
    });
    pending.sort((a, b) => {
      const dateTimeA = parseISO(`${a.date}T${a.startTime}`);
      const dateTimeB = parseISO(`${b.date}T${b.startTime}`);
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
    setPendingEvaluationLessons(pending);
  }, []); // No dependencies, as Lessons is a static import

  const fetchEvaluationHistory = useCallback(async () => {
    setFetchError(null);
    try {
      // Ensure this URL points to your PHP script that handles GET requests
      const response = await fetch('http://192.168.1.51/kreno-api/get_evaluations.php', {
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
      console.log('Fetched DB evaluations:', result);

      if (result.success && Array.isArray(result.evaluations)) {
        setDbEvaluations(result.evaluations);
      } else {
        throw new Error(result.message || 'Failed to fetch evaluation history data.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while fetching history.';
      console.error('Fetch evaluation history error:', errorMessage);
      setFetchError(errorMessage);
      // Alert.alert('Error', `Could not fetch evaluation history: ${errorMessage}`); // Optional: show alert
    }
  }, []); // No dependencies, fetch URL is static

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    processLocalLessonsForPending(); // Process local data for pending
    await fetchEvaluationHistory(); // Fetch history from DB
    if (!isRefresh) setIsLoading(false);
  }, [processLocalLessonsForPending, fetchEvaluationHistory]);


  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(true); // Pass true to indicate it's a refresh
    setIsRefreshing(false);
  }, [loadData]);


  const handleGiveEvaluation = (lesson: Lesson) => {
    router.push({
      pathname: '/Evaluation/EvaluationForm',
      params: { lessonId: lesson.id, lessonTitle: lesson.title }
    });
  };

  const handleViewEvaluation = (evaluation: DBEvaluation) => {
    const lessonTitle = lessons.find(l => l.id === evaluation.lesson_id)?.title || 'Unknown Lesson';
    console.log("Viewing DB Evaluation for lesson ID:", evaluation.lesson_id, evaluation);
    Alert.alert(
      `Evaluation for: ${lessonTitle}`,
      `Rating: ${evaluation.overall_lesson_rating}/5\nComment: ${evaluation.evaluation_comment || 'N/A'}\nSubmitted: ${new Date(evaluation.submitted_at).toLocaleDateString()}`
    );
  };

  const getLessonTitle = (lessonId: string) => {
    return lessons.find(l => l.id === lessonId)?.title || `Lesson ID: ${lessonId}`;
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: "Evaluation", headerShown: false }} />
      <CustomHeader/>

      <ScrollView 
        className="flex-1"
        refreshControl={ // Add RefreshControl here
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#fb923c"]} // Android spinner color
            tintColor={"#fb923c"} // iOS spinner color
          />
        }
      >
        <Text className="text-2xl px-4 mt-3 font-cbold mb-5 text-gray-800">My Evaluations</Text>
        {isLoading && !isRefreshing ? ( // Show initial loader only if not refreshing
          <ActivityIndicator size="large" color="#fb923c" className="mt-20" />
        ) : (
          <>
            {/* Pending Evaluation Section (uses local data) */}
            <View className="px-4 pt-5 pb-3">
              <Text className="text-xl font-csemibold text-gray-700 mb-3">Pending Evaluation</Text>
              {pendingEvaluationLessons.length > 0 ? (
                pendingEvaluationLessons.map(lesson => (
                  <LessonCard
                    key={`pending-${lesson.id}`}
                    lesson={lesson}
                    onPressAction={() => handleGiveEvaluation(lesson)}
                  />
                ))
              ) : (
                <View className="bg-white p-4 rounded-lg shadow items-center">
                  <MaterialCommunityIcons name="check-circle-outline" size={30} color="#4ade80" />
                  <Text className="text-sm text-gray-500 mt-2">No lessons awaiting your Evaluation. Great job!</Text>
                </View>
              )}
            </View>

            {/* Evaluation History Section (uses data from DB) */}
            <View className="px-4 pt-5 pb-5 border-t border-slate-200 mt-3">
              <Text className="text-xl font-csemibold text-gray-700 mb-3">Evaluation History</Text>
              {fetchError && (
                <View className="bg-red-100 p-3 rounded-lg items-center mb-3">
                    <MaterialCommunityIcons name="alert-circle-outline" size={30} color="#ef4444" />
                    <Text className="text-sm text-red-600 mt-2 text-center">Could not load history: {fetchError}</Text>
                </View>
              )}
              {!fetchError && dbEvaluations.length > 0 ? (
                dbEvaluations.map(evaluation => (
                  <TouchableOpacity
                    key={`history-db-${evaluation.evaluation_id}`}
                    className="bg-white p-4 rounded-lg shadow mb-3"
                    onPress={() => handleViewEvaluation(evaluation)}
                  >
                    <Text className="text-base font-csemibold text-blue-600">{getLessonTitle(evaluation.lesson_id)}</Text>
                    <Text className="text-xs text-gray-500 mb-1">Evaluated: {new Date(evaluation.submitted_at).toLocaleDateString()}</Text>
                    <Text className="text-sm text-gray-700">Overall Rating: {evaluation.overall_lesson_rating} / 5</Text>
                    {evaluation.evaluation_comment && <Text className="text-sm text-gray-600 mt-1 italic">"{evaluation.evaluation_comment}"</Text>}
                    <View className="mt-2 pt-2 border-t border-slate-100">
                        <Text className="text-xs text-blue-500 text-right">View Details</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                !fetchError && (
                  <View className="bg-white p-4 rounded-lg shadow items-center">
                      <MaterialCommunityIcons name="history" size={30} color="#60a5fa" />
                      <Text className="text-sm text-gray-500 mt-2">No Evaluation has been submitted yet.</Text>
                  </View>
                )
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

export default EvaluationHistoryList;