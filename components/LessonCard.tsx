import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Lesson interface should match the structure of the lesson object passed as a prop
// (e.g., from LessonContext, which already has formatted times)
export interface Lesson {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // Expected "HH:mm" or "N/A"
  endTime?: string | null; // Expected "HH:mm" or null
  EvaluationGiven?: boolean; // Optional, depending on where the card is used
  location?: string | null;
}

interface LessonCardProps {
  lesson: Lesson; // Lesson prop is now mandatory
  onPressAction: (lessonData: Lesson) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPressAction }) => {

  if (!lesson) {
    return (
      <View className="bg-gray-100 rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
        <Text className="text-gray-500 text-center">Lesson data not available.</Text>
      </View>
    );
  }

  const { title, date, startTime, endTime, location } = lesson;

  let lessonDateDisplay = 'Invalid Date';
  if (date) {
    try {
      // Assuming 'date' is "YYYY-MM-DD"
      const lessonDateObj = parseISO(date);
      lessonDateDisplay = format(lessonDateObj, 'dd/MM/yyyy');
    } catch (e) {
      console.warn("LessonCard: Error parsing date (ID: ", lesson.id, "): ", date, e);
    }
  }

  // startTime and endTime are expected to be pre-formatted "HH:mm" or "N/A"/null
  let timeDisplayValue = startTime || 'N/A';
  if (endTime && endTime !== 'N/A') {
    timeDisplayValue = `${startTime} - ${endTime}`;
  }

  return (
    <TouchableOpacity
      onPress={() => onPressAction(lesson)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 active:bg-gray-100"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1 pr-2">
          <Text className="text-base font-cbold text-gray-800" numberOfLines={1}>{title || 'Lesson Details'}</Text>
          {location && (
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#fb923c" className="mr-1" />
              <Text className="text-sm text-gray-500 font-cregular" numberOfLines={1}>{location}</Text>
            </View>
          )}
        </View>
        <View className="items-end">
          <Text className="text-xs font-cregular text-gray-600">
            {timeDisplayValue}
          </Text>
          <Text className="text-xs font-cregular text-gray-600 mt-1">
            {lessonDateDisplay}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LessonCard;