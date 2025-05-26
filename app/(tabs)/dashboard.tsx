import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import LessonCard from '../../components/LessonCard';
import { isFuture, isPast, parseISO, format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLessonData, Lesson } from '../../context/LessonContext'; // Assuming Lesson type is exported

// Helper function to calculate duration
// This function will now receive startTime and endTime in "HH:mm" format or "N/A"/null
const calculateDuration = (startTime: string, endTime?: string | null): string => {
  if (startTime === 'N/A' || !endTime || endTime === 'N/A') return 'N/A'; // Handle N/A inputs

  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let [endHour, endMinute] = endTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      return 'N/A'; // Invalid time format after split
    }

    if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
      endHour += 24; // Handles overnight duration if endTime is on the next day (simple case)
    }

    const totalStartMinutes = startHour * 60 + startMinute;
    const totalEndMinutes = endHour * 60 + endMinute;
    const durationMinutes = totalEndMinutes - totalStartMinutes;

    if (durationMinutes < 0) return 'N/A';

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    let durationString = '';
    if (hours > 0) durationString += `${hours}h`;
    if (minutes > 0) durationString += `${hours > 0 ? ' ' : ''}${minutes}min`;

    return durationString || '0min';
  } catch (error) {
    console.error("Error calculating duration:", error, "startTime:", startTime, "endTime:", endTime);
    return "N/A";
  }
};

const DetailRow: React.FC<{ iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string; valueColor?: string; isMultiline?: boolean }> =
  ({ iconName, label, value, valueColor = "text-gray-600", isMultiline = false }) => (
    <View className="mb-3">
      <View className="flex-row items-start">
        <MaterialCommunityIcons name={iconName} size={20} color="#f97316" className="mr-2 mt-0.5" />
        <Text className="text-base font-csemibold text-gray-700 flex-shrink mr-1">{label}:</Text>
      </View>
      <Text className={`text-sm ${valueColor} ml-7 ${isMultiline ? 'mt-1' : 'mt-0'}`}>{value}</Text>
    </View>
  );


const Dashboard = () => {
  const {
    lessons: allLessonsFromContext,
    isLoading: lessonsLoading,
    isRefreshing: lessonsRefreshing,
    error: lessonsError,
    fetchCoreData
  } = useLessonData();

  const [isLessonDetailModalVisible, setLessonDetailModalVisible] = useState(false);
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<Lesson | null>(null);

  // Memoize derived data to prevent re-calculations on every render
  const upcomingLessons = useMemo(() => {
    const upcoming: Lesson[] = [];
    allLessonsFromContext.forEach(lesson => {
      if (lesson.date && lesson.startTime && lesson.startTime !== 'N/A') {
        try {
          const lessonDateTimeString = `${lesson.date}T${lesson.startTime}:00`;
          const lessonDateTime = parseISO(lessonDateTimeString);
          if (isFuture(lessonDateTime)) {
            upcoming.push(lesson);
          }
        } catch (e) {
          console.warn(`Dashboard (upcoming): Invalid date/time for lesson ID ${lesson.id}: Date: ${lesson.date}, StartTime: ${lesson.startTime}`, e);
        }
      }
    });
    upcoming.sort((a, b) => {
        try {
            const dateTimeA = parseISO(`${a.date}T${a.startTime}:00`);
            const dateTimeB = parseISO(`${b.date}T${b.startTime}:00`);
            return dateTimeA.getTime() - dateTimeB.getTime();
        } catch { return 0; }
    });
    return upcoming.slice(0, 3);
  }, [allLessonsFromContext]);

  const pendingEvaluationLessons = useMemo(() => {
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
          console.warn(`Dashboard (pending): Invalid date/time for lesson ID ${lesson.id}: Date: ${lesson.date}, StartTime: ${lesson.startTime}`, e);
        }
      }
    });
     // Sort pending evaluation lessons (oldest first)
    pending.sort((a, b) => {
        try {
            const dateTimeA = parseISO(`${a.date}T${a.startTime}:00`);
            const dateTimeB = parseISO(`${b.date}T${b.startTime}:00`);
            // To sort oldest first, subtract B from A
            return dateTimeA.getTime() - dateTimeB.getTime();
        } catch { return 0; }
    });
    // Show only the oldest 3
    return pending.slice(0, 3);
  }, [allLessonsFromContext]);

  const progressSummaryData = useMemo(() => {
    const evaluatedLessons = allLessonsFromContext.filter(lesson => lesson.EvaluationGiven);
    const evaluatedLessonsCount = evaluatedLessons.length;
    // --- PLACEHOLDER DATA ---
    // TODO: Replace these with actual calculations when detailed evaluation data is available.
    // For now, we'll use placeholders if there's at least one evaluated lesson.

    const overallSkillRatingPercent = evaluatedLessonsCount > 0 ? 70 : 0; // Placeholder: 70% if any evaluation, else 0
    
    const keyAreasForImprovement = evaluatedLessonsCount > 0 ? [
      { name: "Roundabout entry/exit", details: "Avg: 2/5 (Placeholder)" },
      { name: "Parallel parking", details: "Avg: 2.5/5 (Placeholder)" },
    ] : [];
    
    const mockTestPerformance = {
      latest: evaluatedLessonsCount > 0 ? "Passed (8 faults - Placeholder)" : "No mock tests recorded",
      // Show previous only if there's a concept of multiple mock tests
      previous: evaluatedLessonsCount > 1 ? "Failed (12 faults - Placeholder)" : null, 
    };
    // --- END PLACEHOLDER DATA ---

    return {
      evaluatedLessonsCount,
      overallSkillRatingPercent, // This will be used for the bar width
      keyAreasForImprovement,
      mockTestPerformance,
    };
  }, [allLessonsFromContext]);


  const onRefresh = useCallback(async () => {
    // Pass true for isRefresh. Add userId if your fetchCoreData expects it.
    await fetchCoreData(true, null /* userId if needed */);
  }, [fetchCoreData]);

  useEffect(() => {
    if (lessonsError) {
      Alert.alert("Error", `Could not load lesson data: ${lessonsError}`);
    }
  }, [lessonsError]);


  const handleLessonDetails = (lesson: Lesson) => {
    setSelectedLessonForModal(lesson);
    setLessonDetailModalVisible(true);
  };

  const handleCloseLessonModal = () => {
    setLessonDetailModalVisible(false);
    setSelectedLessonForModal(null);
  };

  const handleGiveEvaluation = (lesson: Lesson) => {
    router.push({
      pathname: '/Evaluation/EvaluationForm',
      params: { lessonId: lesson.id, lessonTitle: lesson.title }
    });
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        showSettingsIcon={true}
        onSettingsPress={() => router.push("/Settings/SettingScreen")}
      />
      <ScrollView
        className='flex-1'
        refreshControl={
          <RefreshControl
            refreshing={lessonsRefreshing}
            onRefresh={onRefresh}
            colors={["#fb923c"]}
            tintColor={"#fb923c"}
          />
        }
      >
        <View className='pt-3 px-4 pb-5'>
          <Text className="text-2xl font-cbold mb-5 text-gray-800">Dashboard</Text>

          {lessonsLoading && !lessonsRefreshing ? (
            <ActivityIndicator size="large" color="#fb923c" className="mt-10" />
          ) : lessonsError && !allLessonsFromContext.length && !lessonsRefreshing ? (
            <View className="items-center justify-center p-5 bg-red-50 rounded-md my-5">
              <MaterialCommunityIcons name="alert-circle-outline" size={30} color="#ef4444" />
              <Text className="text-red-600 mt-2 text-center">Could not load lessons. Pull down to try again.</Text>
              {lessonsError && <Text className="text-xs text-red-400 mt-1 text-center">Details: {lessonsError}</Text>}
            </View>
          ) : (
            <>
              {/* Upcoming Lessons Section */}
              <Text className="text-xl font-csemibold text-gray-700 mb-3">Upcoming Lessons</Text>
              {upcomingLessons.length > 0 ? (
                upcomingLessons.map(lesson => (
                  <LessonCard
                    key={`upcoming-${lesson.id}`}
                    lesson={lesson} 
                    onPressAction={() => handleLessonDetails(lesson)}
                  />
                ))
              ) : (
                <Text className="text-sm text-gray-500 mb-6 ml-1">No upcoming lessons.</Text>
              )}

              {/* Pending Evaluation Section */}
              <View className="flex-row justify-between items-center mt-6 mb-3">
                <Text className="text-xl font-csemibold text-gray-700">Pending Evaluation</Text>
                <TouchableOpacity
                  onPress={() => router.push('/Evaluation/EvaluationHistoryList')}
                  className="p-2"
                >
                  <MaterialCommunityIcons name="history" size={24} color="#fb923c" />
                </TouchableOpacity>
              </View>
              {pendingEvaluationLessons.length > 0 ? (
                pendingEvaluationLessons.map(lesson => (
                  <LessonCard
                    key={`pending-${lesson.id}`}
                    lesson={lesson} 
                    onPressAction={() => handleGiveEvaluation(lesson)}
                  />
                ))
              ) : (
                <Text className="text-sm text-gray-500 mb-6 ml-1">No lessons awaiting Evaluation.</Text>
              )}

              {/* Progress Summary Section - Now uses progressSummaryData */}
              <Text className="text-xl font-csemibold text-gray-700 mt-6 mb-3">Progress Summary</Text>
              <View className="mb-6 p-4 bg-gray-100 rounded-lg">
                {progressSummaryData.evaluatedLessonsCount > 0 ? (
                  <>
                    <View className="mb-3">
                      <Text className="text-base font-cmedium text-gray-800 mb-1">Overall Skill Rating (Evaluation):</Text>
                      <View className="flex-row items-center">
                        <View className="w-4/5 bg-gray-200 rounded-full h-2.5 mr-2">
                          <View 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${progressSummaryData.overallSkillRatingPercent}%` }}
                          />
                        </View>
                        <Text className="text-sm font-csemibold text-green-600">
                          {progressSummaryData.overallSkillRatingPercent}%
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500 mt-0.5 ml-1">
                        Based on {progressSummaryData.evaluatedLessonsCount} lesson{progressSummaryData.evaluatedLessonsCount === 1 ? '' : 's'} with Evaluation.
                      </Text>
                    </View>

                    {progressSummaryData.keyAreasForImprovement.length > 0 && (
                      <View className="mb-3">
                        <Text className="text-base font-cmedium text-gray-800 mb-1">Key Areas for Improvement:</Text>
                        {progressSummaryData.keyAreasForImprovement.map((area, index) => (
                          <Text key={index} className="text-sm text-gray-600 ml-1">
                            - {area.name} ({area.details})
                          </Text>
                        ))}
                      </View>
                    )}

                    <View>
                      <Text className="text-base font-cmedium text-gray-800 mb-1">Mock Test Performance:</Text>
                      <Text className="text-sm text-gray-600 ml-1">
                        - Latest: <Text className="font-csemibold">{progressSummaryData.mockTestPerformance.latest}</Text>
                      </Text>
                      {progressSummaryData.mockTestPerformance.previous && (
                        <Text className="text-sm text-gray-600 ml-1">
                          - Previous: <Text className="font-csemibold">{progressSummaryData.mockTestPerformance.previous}</Text>
                        </Text>
                      )}
                    </View>
                  </>
                ) : (
                  <Text className="text-sm text-gray-500 text-center py-4">
                    No evaluation data available yet to show progress summary.
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Lesson Detail Modal */}
      {selectedLessonForModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isLessonDetailModalVisible}
          onRequestClose={handleCloseLessonModal}
        >
          <View className='flex-1 justify-center items-center bg-[rgba(0,0,0,0.55)]'>
            <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md relative">
              <View className="flex-row justify-between items-center pb-3 mb-4 border-b border-gray-200">
                <View className="flex-1 mr-2">
                  <Text className="text-xl font-cbold text-gray-800" numberOfLines={1}>{selectedLessonForModal.title}</Text>
                </View>
                <TouchableOpacity onPress={handleCloseLessonModal} className="p-1 -mr-2 -mt-2">
                  <MaterialCommunityIcons name="close-circle-outline" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                <DetailRow
                  iconName="calendar-blank-outline"
                  label="Date"
                  value={selectedLessonForModal.startTime !== 'N/A' ? format(parseISO(`${selectedLessonForModal.date}T${selectedLessonForModal.startTime}:00`), 'EEEE d MMMM yyyy') : format(parseISO(selectedLessonForModal.date), 'EEEE d MMMM yyyy')}
                />
                <DetailRow
                  iconName="clock-outline"
                  label="Time"
                  value={`${selectedLessonForModal.startTime}${selectedLessonForModal.endTime && selectedLessonForModal.endTime !== 'N/A' ? ` - ${selectedLessonForModal.endTime}` : ''}`}
                />
                <DetailRow
                  iconName="timer-sand"
                  label="Duration"
                  value={calculateDuration(selectedLessonForModal.startTime, selectedLessonForModal.endTime)}
                />
                {selectedLessonForModal.skillName && (
                  <DetailRow
                    iconName="lightbulb-on-outline"
                    label="Skill Focus"
                    value={selectedLessonForModal.skillName}
                  />
                )}
                <DetailRow
                  iconName="map-marker-outline"
                  label="Location"
                  value={selectedLessonForModal.location || '-'}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default Dashboard;