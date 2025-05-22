import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native'; // Added Modal, StyleSheet
import { router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lessons, Lesson } from '../../constants/Lessons'; // Adjust path
import LessonCard from '../../components/LessonCard'; // Import the new component
import { isFuture, isPast, parseISO, startOfDay, format } from 'date-fns'; // Added format
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Added for DetailRow

// Helper function to calculate duration (similar to calendar.tsx)
const calculateDuration = (startTime: string, endTime: string): string => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  let [endHour, endMinute] = endTime.split(':').map(Number);

  // Handle midnight end (e.g., 23:00 to 00:00 is 1 hour)
  if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
    endHour += 24;
  }

  const totalStartMinutes = startHour * 60 + startMinute;
  const totalEndMinutes = endHour * 60 + endMinute;
  const durationMinutes = totalEndMinutes - totalStartMinutes;

  if (durationMinutes < 0) return 'N/A'; // Should ideally not happen with correct logic

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  let durationString = '';
  if (hours > 0) durationString += `${hours}h`;
  if (minutes > 0) durationString += `${hours > 0 ? ' ' : ''}${minutes}min`;

  return durationString || '0min';
};

const DetailRow: React.FC<{ iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string; valueColor?: string; isMultiline?: boolean }> =
  ({ iconName, label, value, valueColor = "text-gray-600", isMultiline = false }) => (
    <View className="mb-3">
      <View className="flex-row items-start">
        <MaterialCommunityIcons name={iconName} size={20} color="#f97316" className="mr-2 mt-0.5" />
        {/* Using orange for icon color to match calendar example, adjust if needed */}
        <Text className="text-base font-csemibold text-gray-700 flex-shrink mr-1">{label}:</Text>
      </View>
      <Text className={`text-sm ${valueColor} ml-7 ${isMultiline ? 'mt-1' : 'mt-0'}`}>{value}</Text>
    </View>
  );


const Dashboard = () => {
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [pendingEvaluationLessons, setPendingEvaluationLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLessonDetailModalVisible, setLessonDetailModalVisible] = useState(false); // Modal visibility
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<Lesson | null>(null); // Lesson for modal

  useEffect(() => {
    // Simulate fetching and processing data
    const processLessons = () => {
      const today = startOfDay(new Date());
      const upcoming: Lesson[] = [];
      const pendingEvaluation: Lesson[] = [];

      lessons.forEach(lesson => {
        // Ensure date and startTime are valid before creating a Date object
        if (lesson.date && lesson.startTime) {
          const lessonDateTimeString = `${lesson.date}T${lesson.startTime}`;
          try {
            const lessonDateTime = parseISO(lessonDateTimeString);
            if (lesson.status === 'cancelled') return; // Skip cancelled lessons

            if (isFuture(lessonDateTime) || lessonDateTime >= today) {
              if (lesson.status === 'booked') { // Only show upcoming lessons
                upcoming.push(lesson);
              }
            } else if (isPast(lessonDateTime) && lesson.status === 'completed' && !lesson.EvaluationGiven) {
              pendingEvaluation.push(lesson);
            }
          } catch (error) {
            console.warn(`Invalid date format for lesson ID ${lesson.id}: ${lessonDateTimeString}`, error);
          }
        } else {
          console.warn(`Missing date or startTime for lesson ID ${lesson.id}`);
        }
      });

      // Sort upcoming lessons by date and time (earliest first)
      upcoming.sort((a, b) => {
        const dateTimeA = parseISO(`${a.date}T${a.startTime}`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

      // Sort pending Evaluation lessons by date and time (most recent past first)
      pendingEvaluation.sort((a, b) => {
        const dateTimeA = parseISO(`${a.date}T${a.startTime}`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}`);
        return dateTimeB.getTime() - dateTimeA.getTime();
      });


      setUpcomingLessons(upcoming.slice(0, 3)); // Show max 3 upcoming
      setPendingEvaluationLessons(pendingEvaluation); // Show all pending Evaluation
      setIsLoading(false);
    };

    processLessons();
  }, []);

  const handleLessonDetails = (lesson: Lesson) => { // Changed to accept full lesson object
    setSelectedLessonForModal(lesson);
    setLessonDetailModalVisible(true);
    // console.log('Show details for lesson:', lesson.id); // Keep for debugging if needed
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
      <ScrollView className='flex-1'>
        <View className='pt-3 px-4 pb-5'>
          <Text className="text-2xl font-cbold mb-5 text-gray-800">Dashboard</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#fb923c" className="mt-10" />
          ) : (
            <>
              {/* Upcoming Lessons Section */}
              <Text className="text-xl font-csemibold text-gray-700 mb-3">Upcoming Lessons</Text>
              {upcomingLessons.length > 0 ? (
                upcomingLessons.map(lesson => (
                  <LessonCard
                    key={`upcoming-${lesson.id}`}
                    lesson={lesson}
                    onPressAction={() => handleLessonDetails(lesson)} // This remains the same
                  />
                ))
              ) : (
                <Text className="text-sm text-gray-500 mb-6 ml-1">No upcoming lessons.</Text>
              )}

              {/* Pending Evaluation Section */}
              <View className="flex-row justify-between items-center mt-6 mb-3">
                <Text className="text-xl font-csemibold text-gray-700">Pending Evaluation</Text>
                <TouchableOpacity
                  onPress={() => router.push('/Evaluation/EvaluationHistoryList')} // Navigate to Evaluation History
                  className="p-2" // Add some padding for easier touch
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

              {/* Progress Summary Section - Modified */}
              <Text className="text-xl font-csemibold text-gray-700 mt-6 mb-3">Progress Summary</Text>
              <View className="mb-6 p-4 bg-gray-100 rounded-lg"> 
                {/* Overall Skill Rating */}
                <View className="mb-3">
                  <Text className="text-base font-cmedium text-gray-800 mb-1">Overall Skill Rating (Evaluation):</Text>
                  <View className="flex-row items-center">
                    <View className="w-4/5 bg-gray-200 rounded-full h-2.5 mr-2">
                      <View className="bg-green-500 h-2.5 rounded-full" style={{ width: '70%' }}></View>
                    </View>
                    <Text className="text-sm font-csemibold text-green-600">70%</Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-0.5 ml-1">Based on 5 lessons with Evaluation.</Text>
                </View>

                {/* Key Areas for Improvement */}
                <View className="mb-3">
                  <Text className="text-base font-cmedium text-gray-800 mb-1">Key Areas for Improvement:</Text>
                  <Text className="text-sm text-gray-600 ml-1">- Roundabout entry/exit (Avg: 2/5)</Text>
                  <Text className="text-sm text-gray-600 ml-1">- Parallel parking (Avg: 2.5/5)</Text>
                </View>

                {/* Mock Test Performance */}
                <View>
                  <Text className="text-base font-cmedium text-gray-800 mb-1">Mock Test Performance:</Text>
                  <Text className="text-sm text-gray-600 ml-1">- Latest: <Text className="font-csemibold">Passed (8 faults)</Text></Text>
                  <Text className="text-sm text-gray-600 ml-1">- Previous: <Text className="font-csemibold">Failed (12 faults)</Text></Text>
                </View>
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
              {/* Header */}
              <View className="flex-row justify-between items-center pb-3 mb-4 border-b border-gray-200">
                <View className="flex-1 mr-2">
                  <Text className="text-xl font-cbold text-gray-800" numberOfLines={1}>{selectedLessonForModal.title}</Text>
                  {selectedLessonForModal.type && (
                    <Text className="text-sm font-cregular text-gray-500 mt-0.5" numberOfLines={1}>{selectedLessonForModal.type}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={handleCloseLessonModal} className="p-1 -mr-2 -mt-2">
                  <MaterialCommunityIcons name="close-circle-outline" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <DetailRow
                  iconName="calendar-blank-outline"
                  label="Date"
                  value={format(parseISO(`${selectedLessonForModal.date}T${selectedLessonForModal.startTime}`), 'EEEE d MMMM yyyy')}
                />
                <DetailRow
                  iconName="clock-outline"
                  label="Time"
                  value={`${selectedLessonForModal.startTime} - ${selectedLessonForModal.endTime}`}
                />
                <DetailRow
                  iconName="timer-sand"
                  label="Duration"
                  value={calculateDuration(selectedLessonForModal.startTime, selectedLessonForModal.endTime)}
                />
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