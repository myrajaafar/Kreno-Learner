import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookedLesson } from '../constants/BookedLessons'; // Adjust path as needed
import { format, parseISO } from 'date-fns'; // Added parseISO

interface LessonCardProps {
  lesson: BookedLesson;
  // isUpcoming prop might still be useful if you want to subtly style the card differently,
  // but the explicit text button is removed.
  // isUpcoming: boolean; 
  onPressAction: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPressAction }) => {
  // Ensure lesson.date and lesson.startTime are valid before parsing
  let lessonDateDisplay = 'Invalid Date';
  if (lesson.date && lesson.startTime) {
    try {
      const lessonDateTime = parseISO(`${lesson.date}T${lesson.startTime}`);
      lessonDateDisplay = format(lessonDateTime, 'dd/MM/yyyy');
    } catch (e) {
      console.warn("Error parsing date for lesson card:", lesson.id, e);
    }
  }


  return (
    <TouchableOpacity 
      onPress={onPressAction}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200 active:bg-gray-100"
    >
      <View className="flex-row justify-between">
        {/* Left Side: Lesson Type & Location */}
        <View className="flex-1 pr-2 justify-between">
          <Text className="text-base font-cbold text-gray-700" numberOfLines={1}>{lesson.type}</Text>
          <Text className="text-sm text-gray-500 font-cregular" numberOfLines={1}>{lesson.location || 'N/A'}</Text>
        </View>

        {/* Right Side: Time & Date */}
        <View className="items-end justify-between">
          <Text className="text-xs font-cregular text-gray-600">
            {lesson.startTime} - {lesson.endTime}
          </Text>
          <Text className="text-xs font-cregular text-gray-600 mb-1">
            {lessonDateDisplay}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LessonCard;