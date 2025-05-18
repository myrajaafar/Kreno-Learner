import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookedLessons, BookedLesson } from '../../constants/BookedLessons'; // Adjust path as needed
import LessonCard from '../../components/LessonCard'; // Assuming you want to reuse LessonCard
import { isPast, parseISO, startOfDay } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/CustomHeader';

const EvaluationHistoryList = () => {
  const [pendingEvaluationLessons, setPendingEvaluationLessons] = useState<BookedLesson[]>([]);
  const [completedEvaluationLessons, setCompletedEvaluationLessons] = useState<BookedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processLessons = () => {
      const today = startOfDay(new Date());
      const pending: BookedLesson[] = [];
      const completed: BookedLesson[] = [];

      bookedLessons.forEach(lesson => {
        if (lesson.date && lesson.startTime) {
          const lessonDateTimeString = `${lesson.date}T${lesson.startTime}`;
          try {
            const lessonDateTime = parseISO(lessonDateTimeString);

            if (lesson.status === 'completed') {
              if (!lesson.EvaluationGiven && isPast(lessonDateTime)) {
                pending.push(lesson);
              } else if (lesson.EvaluationGiven) {
                // Optionally, you might also want to ensure it's in the past for history,
                // but typically EvaluationGiven implies it's a past, completed lesson.
                completed.push(lesson);
              }
            }
          } catch (error) {
            console.warn(`Invalid date format for lesson ID ${lesson.id} in EvaluationHistoryList: ${lessonDateTimeString}`, error);
          }
        }
      });

      // Sort pending Evaluation (most recent first, or oldest first depending on preference)
      pending.sort((a, b) => {
        const dateTimeA = parseISO(`${a.date}T${a.startTime}`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // Most recent completed lesson first
      });

      // Sort completed Evaluation history (most recent Evaluation first)
      completed.sort((a, b) => {
        // Assuming Evaluation might have a submission date, otherwise sort by lesson date
        const dateTimeA = parseISO(`${a.date}T${a.startTime}`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // Most recent lesson first
      });

      setPendingEvaluationLessons(pending);
      setCompletedEvaluationLessons(completed);
      setIsLoading(false);
    };

    processLessons();
  }, []);

  const handleGiveEvaluation = (lesson: BookedLesson) => {
    router.push({
      pathname: '/Evaluation/EvaluationForm', // Ensure this route exists
      params: { lessonId: lesson.id, lessonTitle: lesson.title }
    });
  };

  const handleViewEvaluation = (lesson: BookedLesson) => {
    // Navigate to a screen to view the details of already submitted Evaluation
    // You'll need to create this screen, e.g., '/Evaluation/EvaluationDetailScreen'
    console.log("Navigate to view Evaluation for lesson:", lesson.id);
    // router.push({ pathname: '/Evaluation/EvaluationDetailScreen', params: { lessonId: lesson.id } });
    alert(`Viewing Evaluation for: ${lesson.title}\n(Implement EvaluationDetailScreen)`);
  };


  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: "Evaluation", headerShown: false }} />
      <CustomHeader/>

      <ScrollView className="flex-1">
        <Text className="text-2xl px-4 mt-3 font-cbold mb-5 text-gray-800">Evaluation History</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#fb923c" className="mt-20" />
        ) : (
          <>
            {/* Pending Evaluation Section */}
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

            {/* Evaluation History Section */}
            <View className="px-4 pt-5 pb-5 border-t border-slate-200 mt-3">
              <Text className="text-xl font-csemibold text-gray-700 mb-3">Evaluation History</Text>
              {completedEvaluationLessons.length > 0 ? (
                completedEvaluationLessons.map(lesson => (
                  // You might want a different card or modified LessonCard for history items
                  <LessonCard
                    key={`history-${lesson.id}`}
                    lesson={lesson}
                    onPressAction={() => handleViewEvaluation(lesson)}
                  />
                ))
              ) : (
                <View className="bg-white p-4 rounded-lg shadow items-center">
                    <MaterialCommunityIcons name="history" size={30} color="#60a5fa" />
                    <Text className="text-sm text-gray-500 mt-2">No Evaluation has been submitted yet.</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

export default EvaluationHistoryList;