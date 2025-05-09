import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays, startOfWeek, getDate, isSameDay, eachDayOfInterval, getHours, setHours, setMinutes, setSeconds, setMilliseconds, isBefore } from 'date-fns';
import { Stack } from 'expo-router';
import { staticBookedLessons, BookedLesson } from '../../constants/BookedLessons'; // Ensure BookedLesson type is exported

const firstName = 'Myra';
const lastName = 'Jaafar';

const PROFILE_PIC_URL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=BDBDBD&color=fff`;

const CustomHeader = () => {
  return (
    <View className="flex-row items-center p-7 bg-[#42509A17] rounded-b-[50px] mb-4">
      <Image source={{ uri: PROFILE_PIC_URL }} className="w-10 h-10 rounded-full mr-3" />
      <View>
        <Text className="text-[#42509A] font-cbold text-lg">Myra Jaafar</Text>
        <Text className="text-[#A8ACB4] font-cregular text-sm">Student</Text>
      </View>
    </View>
  );
};

const DayDateComponent = ({ date, isToday, onPress, isSelected }) => {
  const dayName = format(date, 'E');
  const dayNumber = getDate(date);

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      className={`items-center p-2 rounded-lg w-12 h-16 justify-center mx-1 ${isSelected ? 'bg-orange-500' : 'bg-gray-100'
        } ${isToday && !isSelected ? 'border-2 border-orange-500' : ''}`}
    >
      <Text className={`font-cbold text-[11px] ${isSelected ? 'text-white' : 'text-[#42509A]'}`}>{dayName}</Text>
      <View
        className={`w-7 h-7 rounded-full items-center justify-center mt-1 ${isSelected ? '' : isToday ? 'bg-orange-500' : 'bg-transparent'
          }`}
      >
        <Text className={`font-cbold text-[15px] ${isSelected || (isToday && !isSelected) ? 'text-white' : 'text-orange-500'}`}>
          {dayNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const lessonsForSelectedDate = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const filteredLessons = staticBookedLessons.filter(lesson => lesson.date === dateKey);
    return filteredLessons;
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [currentDate]);

  // ... (rest of the component, including timeSlots, useEffect, handlers, and return statement) ...
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i <= 23; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const slotPixelHeight = 64;

  useEffect(() => {
    if (isSameDay(selectedDate, new Date()) && scrollViewRef.current && timeSlots.length > 0) {
      const currentHour = getHours(new Date());
      const offset = currentHour * slotPixelHeight;
      scrollViewRef.current.scrollTo({ y: offset, animated: false });
    }
  }, [selectedDate, timeSlots]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (!isSameDay(date, new Date()) && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  };

  const handleTimeSlotPress = (timeSlot: string) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const slotKey = `${dateKey}_${timeSlot}`;

    const now = new Date();
    const slotHour = parseInt(timeSlot.split(':')[0], 10);

    let slotDateTime = setHours(selectedDate, slotHour);
    slotDateTime = setMinutes(slotDateTime, 0);
    slotDateTime = setSeconds(slotDateTime, 0);
    slotDateTime = setMilliseconds(slotDateTime, 0);

    if (isBefore(slotDateTime, now)) {
      return;
    }

    const slotStartMinutes = slotHour * 60;
    const slotEndMinutes = slotStartMinutes + 60;

    for (const lesson of lessonsForSelectedDate) {
      const lessonStartMinutes = parseInt(lesson.startTime.split(':')[0], 10) * 60 + parseInt(lesson.startTime.split(':')[1], 10);
      const lessonEndMinutes = parseInt(lesson.endTime.split(':')[0], 10) * 60 + parseInt(lesson.endTime.split(':')[1], 10);
      if (Math.max(slotStartMinutes, lessonStartMinutes) < Math.min(slotEndMinutes, lessonEndMinutes)) {
        return;
      }
    }

    setAvailableSlots(prev => ({
      ...prev,
      [slotKey]: !prev[slotKey]
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader />

      <View className="px-4">
        <Text className="text-2xl font-cbold mb-3 text-gray-800">Calendar</Text>
        <View className="flex-row justify-between mb-4">
          {weekDays.map((day) => (
            <DayDateComponent
              key={day.toISOString()}
              date={day}
              isToday={isSameDay(day, new Date())}
              isSelected={isSameDay(day, selectedDate)}
              onPress={handleDateSelect}
            />
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        ref={scrollViewRef}>
        <View className="flex-row">
          <View className="w-16 pr-2 pt-2">
            {timeSlots.map((time, index) => (
              <View key={time} className={`h-16 items-end ${index === 0 ? 'pt-1' : ''}`}>
                <Text className="text-xs text-gray-500 font-cregular">{time}</Text>
              </View>
            ))}
          </View>

          <View className="flex-1 bg-slate-100 rounded-lg">
            {timeSlots.map((time, timeIndex) => {
              const dateKey = format(selectedDate, 'yyyy-MM-dd');
              const slotKey = `${dateKey}_${time}`;
              const isSlotAvailable = availableSlots[slotKey];

              const currentSlotHour = parseInt(time.split(':')[0], 10);
              const slotStartMinutes = currentSlotHour * 60;
              const slotEndMinutes = slotStartMinutes + 60;

              // Find any lesson that overlaps with this slot
              let bookedLessonForSlot: BookedLesson | undefined = undefined;
              for (const lesson of lessonsForSelectedDate) {
                const lessonStartMinutes =
                  parseInt(lesson.startTime.split(':')[0], 10) * 60 +
                  parseInt(lesson.startTime.split(':')[1], 10);
                const lessonEndMinutes =
                  parseInt(lesson.endTime.split(':')[0], 10) * 60 +
                  parseInt(lesson.endTime.split(':')[1], 10);

                // Check if the lesson overlaps with the current slot
                if (
                  lessonStartMinutes < slotEndMinutes &&
                  lessonEndMinutes > slotStartMinutes
                ) {
                  bookedLessonForSlot = lesson;
                  break; // Take the first lesson that overlaps (optional: handle multiple overlaps if needed)
                }
              }

              let slotStyle = 'bg-transparent';
              let slotContent = null;

              if (bookedLessonForSlot) {
                slotStyle = `${bookedLessonForSlot.color} opacity-80`;
                slotContent = (
                  <Text
                    className="text-white font-cmedium text-xs text-center p-1"
                    numberOfLines={2}
                  >
                    {bookedLessonForSlot.title}
                  </Text>
                );
              } else if (isSlotAvailable) {
                const now = new Date();
                let slotDateTime = setHours(selectedDate, currentSlotHour);
                slotDateTime = setMinutes(slotDateTime, 0);
                slotDateTime = setSeconds(slotDateTime, 0);
                slotDateTime = setMilliseconds(slotDateTime, 0);
                if (!isBefore(slotDateTime, now)) {
                  slotStyle = 'bg-green-200';
                  slotContent = (
                    <Text className="text-green-700 font-cmedium text-xs">Available</Text>
                  );
                } else {
                  slotStyle = 'bg-gray-50';
                }
              } else {
                const now = new Date();
                let slotDateTime = setHours(selectedDate, currentSlotHour);
                slotDateTime = setMinutes(slotDateTime, 0);
                slotDateTime = setSeconds(slotDateTime, 0);
                slotDateTime = setMilliseconds(slotDateTime, 0);
                if (isBefore(slotDateTime, now)) {
                  slotStyle = 'bg-gray-50';
                }
              }

              return (
                <TouchableOpacity
                  key={`grid-slot-${time}`}
                  className={`flex-row border-b border-slate-200 h-16 items-center justify-center ${slotStyle}`}
                  onPress={() => handleTimeSlotPress(time)}
                  disabled={
                    !!bookedLessonForSlot ||
                    (isBefore(
                      setHours(selectedDate, currentSlotHour),
                      new Date()
                    ) &&
                      !isSameDay(setHours(selectedDate, currentSlotHour), new Date()))
                  }
                >
                  <View className="flex-1 border-r border-slate-200 h-full items-center justify-center p-1">
                    {slotContent}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarScreen;