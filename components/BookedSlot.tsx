import React from 'react';
import { View, Text } from 'react-native';
import { BookedLesson } from '../constants/BookedLessons'; // Adjust the import based on your project structure

const EventBlock = ({ event, slotHeight, firstHour }: { event: BookedLesson, slotHeight: number, firstHour: number }) => {
  const startHour = parseInt(event.startTime.split(':')[0], 10);
  const startMinutes = parseInt(event.startTime.split(':')[1], 10);
  const endHour = parseInt(event.endTime.split(':')[0], 10);
  const endMinutes = parseInt(event.endTime.split(':')[1], 10);

  const topPosition = ((startHour - firstHour) + (startMinutes / 60)) * slotHeight;
  const durationHours = (endHour + endMinutes / 60) - (startHour + startMinutes / 60);
  const blockHeight = durationHours * slotHeight;

  if (blockHeight <= 0) return null; // Should not happen with valid end times

  return (
    <View
      style={{
        position: 'absolute',
        top: topPosition,
        left: 2,
        right: 2,
        height: blockHeight - 2, // Subtract a bit for visual spacing if needed
        zIndex: 10, // Ensure it's above the grid cells
      }}
      className={`p-1 rounded-md shadow-sm ${event.color} overflow-hidden`}
    >
      <Text className="text-white font-cbold text-xs" numberOfLines={2}>{event.title}</Text>
    </View>
  );
};

export default EventBlock;