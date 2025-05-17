import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native'; // Added Modal, StyleSheet
import { router } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookedLessons, BookedLesson } from '../../constants/BookedLessons'; // Adjust path
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
  const [upcomingLessons, setUpcomingLessons] = useState<BookedLesson[]>([]);
  const [pendingFeedbackLessons, setPendingFeedbackLessons] = useState<BookedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLessonDetailModalVisible, setLessonDetailModalVisible] = useState(false); // Modal visibility
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<BookedLesson | null>(null); // Lesson for modal

  useEffect(() => {
    // Simulate fetching and processing data
    const processLessons = () => {
      const today = startOfDay(new Date());
      const upcoming: BookedLesson[] = [];
      const pendingFeedback: BookedLesson[] = [];

      bookedLessons.forEach(lesson => {
        // Ensure date and startTime are valid before creating a Date object
        if (lesson.date && lesson.startTime) {
          const lessonDateTimeString = `${lesson.date}T${lesson.startTime}`;
          try {
            const lessonDateTime = parseISO(lessonDateTimeString);

            if (isFuture(lessonDateTime) || lessonDateTime >= today) {
              upcoming.push(lesson);
            } else if (isPast(lessonDateTime) && !lesson.feedbackGiven) {
              pendingFeedback.push(lesson);
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

      // Sort pending feedback lessons by date and time (most recent past first)
      pendingFeedback.sort((a, b) => {
        const dateTimeA = parseISO(`${a.date}T${a.startTime}`);
        const dateTimeB = parseISO(`${b.date}T${b.startTime}`);
        return dateTimeB.getTime() - dateTimeA.getTime();
      });


      setUpcomingLessons(upcoming.slice(0, 3)); // Show max 3 upcoming
      setPendingFeedbackLessons(pendingFeedback.slice(0, 3)); // Show max 3 pending
      setIsLoading(false);
    };

    processLessons();
  }, []);

  const handleLessonDetails = (lesson: BookedLesson) => { // Changed to accept full lesson object
    setSelectedLessonForModal(lesson);
    setLessonDetailModalVisible(true);
    // console.log('Show details for lesson:', lesson.id); // Keep for debugging if needed
  };

  const handleCloseLessonModal = () => {
    setLessonDetailModalVisible(false);
    setSelectedLessonForModal(null);
  };

  const handleGiveFeedback = (lesson) => {
    router.push({
      pathname: '/Feedback/FeedbackForm',
      params: { lessonId: lesson.id, lessonTitle: lesson.title }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
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

              {/* Pending Feedback Section */}
              <Text className="text-xl font-csemibold text-gray-700 mt-6 mb-3">Pending Feedback</Text>
              {pendingFeedbackLessons.length > 0 ? (
                pendingFeedbackLessons.map(lesson => (
                  <LessonCard
                    key={`pending-${lesson.id}`}
                    lesson={lesson}
                    onPressAction={() => handleGiveFeedback(lesson)} // This remains the same
                  />
                ))
              ) : (
                <Text className="text-sm text-gray-500 mb-6 ml-1">No lessons awaiting feedback.</Text>
              )}
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
          <View style={styles.centeredView}>
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
                {/* Add other lesson details here if available, e.g., instructor */}
                {/* 
                {selectedLessonForModal.instructorId && (
                  <DetailRow 
                    iconName="account-tie-outline" 
                    label="Instructor" 
                    value={selectedLessonForModal.instructorId} // Replace with actual instructor name if available
                  />
                )}
                */}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// Styles for the modal (similar to calendar.tsx)
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)', // Semi-transparent background
  },
});

export default Dashboard;