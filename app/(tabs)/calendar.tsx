import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays, startOfWeek, getDate, isSameDay, eachDayOfInterval, getHours, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, subDays } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
//import { BlurView } from '@react-native-community/blur';
import { Stack, useFocusEffect } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { BookedLesson, bookedLessons } from '../../constants/BookedLessons';

const DayDateComponent = ({ date, isToday, onPress, isSelected }) => {
  const dayName = format(date, 'E');
  const dayNumber = getDate(date);

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      className={`items-center rounded-lg w-12 h-16 justify-center mx-0.5 ${isSelected ? 'bg-orange-500' : 'bg-gray-100'
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

const calculateDuration = (startTime: string, endTime: string): string => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  let [endHour, endMinute] = endTime.split(':').map(Number);

  // Handle cases where endTime is '00:00' for lessons ending at midnight
  if (endHour === 0 && endMinute === 0 && startHour > endHour) {
    endHour = 24;
  }

  let totalStartMinutes = startHour * 60 + startMinute;
  let totalEndMinutes = endHour * 60 + endMinute;

  if (totalEndMinutes < totalStartMinutes) { // Handles overnight case if not already handled by 00:00 logic
    totalEndMinutes += 24 * 60;
  }

  const durationMinutes = totalEndMinutes - totalStartMinutes;

  if (durationMinutes < 0) return 'N/A'; // Should not happen with correct logic

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  let durationString = '';
  if (hours > 0) {
    durationString += `${hours}h`;
  }
  if (minutes > 0) {
    durationString += `${hours > 0 ? ' ' : ''}${minutes}min`;
  }
  return durationString || '0min'; // Default to 0min if calculation results in empty
};

const DetailRow: React.FC<{ iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string; valueColor?: string; isMultiline?: boolean }> = 
({ iconName, label, value, valueColor = "text-gray-600", isMultiline = false }) => (
  <View className="mb-3">
    <View className="flex-row items-start">
      <MaterialCommunityIcons name={iconName} size={20} color="#f97316" className="mr-2 mt-0.5" />
      <Text className="text-base font-csemibold text-gray-700 flex-shrink mr-1">{label}:</Text>
    </View>
    <Text className={`text-sm ${valueColor} ml-8 ${isMultiline ? 'mt-1' : 'mt-0'}`}>{value}</Text>
  </View>
);

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLessonDetailModalVisible, setLessonDetailModalVisible] = useState(false); // New state for lesson detail modal
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<BookedLesson | null>(null); // New state for selected lesson data

  useFocusEffect(
    React.useCallback(() => {
      const today = new Date();
      setSelectedDate(today);
      setCurrentDate(today);
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    const today = new Date(); ~
      setSelectedDate(today);
    setCurrentDate(today);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const lessonsForSelectedDate = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const filteredLessons = bookedLessons.filter(lesson => lesson.date === dateKey);
    return filteredLessons;
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i <= 23; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const slotPixelHeight = 64;

  useEffect(() => {
    if (isSameDay(selectedDate, new Date()) && scrollViewRef.current && timeSlots.length > 0) {
      const now = new Date();
      const currentHour = getHours(now);
      const currentMinute = now.getMinutes();
      const slotIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
      const offset = slotIndex * slotPixelHeight;
      scrollViewRef.current.scrollTo({ y: offset, animated: false });
    }
  }, [selectedDate, timeSlots, slotPixelHeight]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    hideDatePicker();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (!weekDays.some(weekDay => isSameDay(weekDay, date))) {
      setCurrentDate(date);
    }
    if (!isSameDay(date, new Date()) && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  };

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const handleTimeSlotPress = (timeSlot: string, lesson?: BookedLesson) => {
    if (lesson) {
      setSelectedLessonForModal(lesson);
      setLessonDetailModalVisible(true);
      return;
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const slotKey = `${dateKey}_${timeSlot}`;

    const now = new Date();
    const [hourStr, minuteStrVal] = timeSlot.split(':');
    const slotHour = parseInt(hourStr, 10);
    const slotMinute = parseInt(minuteStrVal, 10);

    let slotDateTime = setHours(selectedDate, slotHour);
    slotDateTime = setMinutes(slotDateTime, slotMinute);
    slotDateTime = setSeconds(slotDateTime, 0);
    slotDateTime = setMilliseconds(slotDateTime, 0);

    if (isBefore(slotDateTime, now) && !isSameDay(slotDateTime, now)) {
      if (!availableSlots[slotKey]) {
        return;
      }
    }

    const slotStartMinutes = slotHour * 60 + slotMinute;
    const slotEndMinutes = slotStartMinutes + 30;

    for (const existingLesson of lessonsForSelectedDate) {
      const lessonStartHour = parseInt(existingLesson.startTime.split(':')[0], 10);
      const lessonStartMinuteVal = parseInt(existingLesson.startTime.split(':')[1], 10);
      const lessonStartMinutes = lessonStartHour * 60 + lessonStartMinuteVal;

      let lessonEndHour = parseInt(existingLesson.endTime.split(':')[0], 10);
      let lessonEndMinuteVal = parseInt(existingLesson.endTime.split(':')[1], 10);

      if (existingLesson.endTime === '00:00' && lessonStartHour > lessonEndHour) {
        lessonEndHour = 24;
        lessonEndMinuteVal = 0;
      }
      const lessonEndMinutes = lessonEndHour * 60 + lessonEndMinuteVal;

      if (
        lessonStartMinutes < slotEndMinutes &&
        lessonEndMinutes > slotStartMinutes
      ) {
        return;
      }
    }

    if (availableSlots[slotKey]) {
      Alert.alert(
        "Confirm Removal",
        "Are you sure you want to remove this availability slot?",
        [
          {
            text: "No",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              setAvailableSlots(prev => {
                const updatedSlots = { ...prev };
                delete updatedSlots[slotKey];
                return updatedSlots;
              });
            }
          }
        ]
      );
    } else {
      setAvailableSlots(prev => ({
        ...prev,
        [slotKey]: true
      }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader />

      <View className="pt-3 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-cbold text-gray-800">Calendar</Text>
          <TouchableOpacity
            className='bg-orange-500 rounded-lg p-2'
            onPress={showDatePicker}>
            <Text className="font-csemibold text-white m-1">
              {format(selectedDate, 'MMMM - yyyy')}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-center mb-4">
          <TouchableOpacity onPress={handlePreviousWeek} className="pr-2">
            <MaterialCommunityIcons name="chevron-left" size={25} color="#42509A" />
          </TouchableOpacity>
          {weekDays.map((day) => (
            <DayDateComponent
              key={day.toISOString()}
              date={day}
              isToday={isSameDay(day, new Date())}
              isSelected={isSameDay(day, selectedDate)}
              onPress={handleDateSelect}
            />
          ))}
          <TouchableOpacity onPress={handleNextWeek} className="pl-2">
            <MaterialCommunityIcons name="chevron-right" size={25} color="#42509A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-1 pb-5"
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#FF6347', '#42509A']} />
        }>
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

              const [hourStr, minuteStrVal] = time.split(':');
              const currentSlotHour = parseInt(hourStr, 10);
              const currentSlotMinute = parseInt(minuteStrVal, 10);

              const now = new Date();
              let slotDateTime = setHours(selectedDate, currentSlotHour);
              slotDateTime = setMinutes(slotDateTime, currentSlotMinute);
              slotDateTime = setSeconds(slotDateTime, 0);
              slotDateTime = setMilliseconds(slotDateTime, 0);

              const isPastSlot = isBefore(slotDateTime, now);

              let bookedLessonForSlot: BookedLesson | undefined = undefined;
              const slotStartMinutes = currentSlotHour * 60 + currentSlotMinute;
              const slotEndMinutes = slotStartMinutes + 30;

              for (const lesson of lessonsForSelectedDate) {
                const lessonStartHour = parseInt(lesson.startTime.split(':')[0], 10);
                const lessonStartMinuteVal = parseInt(lesson.startTime.split(':')[1], 10);
                const lessonStartMinutes = lessonStartHour * 60 + lessonStartMinuteVal;

                let lessonEndHour = parseInt(lesson.endTime.split(':')[0], 10);
                let lessonEndMinuteVal = parseInt(lesson.endTime.split(':')[1], 10);

                if (lesson.endTime === '00:00' && lessonStartHour > lessonEndHour) {
                  lessonEndHour = 24;
                  lessonEndMinuteVal = 0;
                }
                const lessonEndMinutes = lessonEndHour * 60 + lessonEndMinuteVal;

                if (
                  lessonStartMinutes < slotEndMinutes &&
                  lessonEndMinutes > slotStartMinutes
                ) {
                  bookedLessonForSlot = lesson;
                  break;
                }
              }

              let slotStyle = 'bg-transparent';
              let slotContent = null;

              if (bookedLessonForSlot) {
                slotStyle = `bg-[#E1BEE8] opacity-80`;
                slotContent = (
                  <Text
                    className="text-[#673172] font-cbold text-center"
                    numberOfLines={2}
                  >
                    {bookedLessonForSlot.title}
                  </Text>
                );
              } else if (isSlotAvailable) {
                slotStyle = 'bg-green-200';
                slotContent = (
                  <Text className="text-green-700 font-cbold">Available</Text>
                );
              } else {
                if (isPastSlot) {
                  slotStyle = 'bg-gray-50';
                }
              }

              return (
                <TouchableOpacity
                  key={`grid-slot-${time}`}
                  className={`flex-row border-b border-slate-200 h-16 items-center justify-center ${slotStyle}`}
                  onPress={() => handleTimeSlotPress(time, bookedLessonForSlot)}
                  disabled={
                    !bookedLessonForSlot &&
                    isPastSlot &&
                    !isSlotAvailable
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
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={selectedDate}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
      {selectedLessonForModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isLessonDetailModalVisible}
          onRequestClose={() => {
            setLessonDetailModalVisible(!isLessonDetailModalVisible);
            setSelectedLessonForModal(null);
          }}
        >
          <View className='flex-1 justify-center items-center bg-[#000000aa]'>
            <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 relative">
              <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-gray-200">
                <View>
                  <Text className="text-xl font-cbold text-gray-800" numberOfLines={1}>{selectedLessonForModal.title}</Text>
                  {selectedLessonForModal.type && (
                    <Text className="font-cbold text-gray-500">{selectedLessonForModal.type}</Text>
                  )}
                </View>
                
                <TouchableOpacity onPress={() => {
                    setLessonDetailModalVisible(!isLessonDetailModalVisible);
                    setSelectedLessonForModal(null);
                  }} className="p-1 -mr-3 -mt-5">
                  <MaterialCommunityIcons name="close-circle-outline" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <DetailRow iconName="calendar-blank-outline" label="Date" value={format(selectedDate, 'EEEE d MMMM yyyy')} />
              <DetailRow iconName="clock-outline" label="Time" value={`${selectedLessonForModal.startTime} - ${selectedLessonForModal.endTime}`} />
              <DetailRow iconName="timer-sand" label="Duration" value={calculateDuration(selectedLessonForModal.startTime, selectedLessonForModal.endTime)} />
              <DetailRow iconName="map-marker-outline" label="Location" value={selectedLessonForModal.location || '-'} />
            </View>
          </View>
          {/*<BlurView
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            blurType="light" // Or "dark", "xlight", "prominent" etc. (iOS) / "light", "dark" (Android)
            blurAmount={10} // Adjust blur intensity
            reducedTransparencyFallbackColor="white"
          >
            <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 relative">
              <TouchableOpacity
                className="absolute top-3 right-3 p-1 z-10"
                onPress={() => {
                  setLessonDetailModalVisible(!isLessonDetailModalVisible);
                  setSelectedLessonForModal(null);
                }}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={28} color="#4A5568" />
              </TouchableOpacity>

              <View className="p-4 rounded-md mb-4 bg-[#E1BEE8]">
                <Text className="text-xl font-cbold text-white">{selectedLessonForModal.title}</Text>
                {selectedLessonForModal.type && (
                  <Text className="text-sm font-cregular text-white mt-1">{selectedLessonForModal.type}</Text>
                )}
              </View>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="clock-outline" size={20} color="#4A5568" className="mr-2" />
                <Text className="text-base font-csemibold text-gray-700">Date et heure</Text>
              </View>
              <Text className="text-sm text-gray-600 mb-4 ml-7">
                {format(selectedDate, 'EEEE d MMMM yyyy')} {selectedLessonForModal.startTime} - {selectedLessonForModal.endTime}
              </Text>

              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#4A5568" className="mr-2" />
                <Text className="text-base font-csemibold text-gray-700">Lieu</Text>
              </View>
              <Text className="text-sm text-gray-600 ml-7">
                {selectedLessonForModal.location || '-'}
              </Text>
            </View>
          </BlurView>*/}
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default CalendarScreen;