import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { format, addDays, startOfWeek, getDate, isSameDay, eachDayOfInterval, getHours, setHours, setMinutes, setSeconds, setMilliseconds, isBefore, subDays, parseISO, isPast } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { useLessonData, Lesson } from '../../context/LessonContext';
import { useAvailability, AvailabilitySlot } from '../../context/AvailabilityContext'; // Ensure path is correct
import { useAuth } from '../../context/AuthContext'; // Ensure path is correct

const DayDateComponent = ({ date, isToday, onPress, isSelected, hasLessons }) => {
  const dayName = format(date, 'E');
  const dayNumber = getDate(date);

  // Determine background color based on selection, lessons, and default
  let backgroundColorClass = 'bg-gray-100'; // Default
  if (isSelected) {
    backgroundColorClass = 'bg-orange-500';
  } else if (hasLessons) {
    backgroundColorClass = 'bg-orange-200'; // (not selected)
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      className={`items-center rounded-lg w-12 h-16 justify-center mx-0.5 
        ${backgroundColorClass}
        ${isToday && !isSelected ? 'border-2 border-orange-500' : ''}`}
    >
      <Text className={`font-cbold text-[11px] ${isSelected ? 'text-white' : 'text-[#42509A]'}`}>{dayName}</Text>
      <View
        className={`w-7 h-7 rounded-full items-center justify-center mt-1 
          ${isSelected ? '' : isToday ? 'bg-orange-500' : 'bg-transparent'}`}
      >
        <Text className={`font-cbold text-[15px] 
          ${isSelected || (isToday && !isSelected) ? 'text-white' : 
            (hasLessons && !isSelected) ? 'text-orange-600' : 'text-orange-500'}`}>
          {dayNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const calculateDuration = (startTime: string, endTime?: string | null): string => {
  if (startTime === 'N/A' || !endTime || endTime === 'N/A') return 'N/A';

  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let [endHour, endMinute] = endTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      return 'N/A';
    }
    
    // Handle cases where endTime is '00:00' for lessons ending at midnight
    if (endHour === 0 && endMinute === 0 && startHour > endHour) {
      endHour = 24;
    }

    let totalStartMinutes = startHour * 60 + startMinute;
    let totalEndMinutes = endHour * 60 + endMinute;

    // If end time is earlier than start time (e.g. 23:00 - 01:00), assume it's on the next day.
    if (totalEndMinutes < totalStartMinutes) {
      totalEndMinutes += 24 * 60;
    }

    const durationMinutes = totalEndMinutes - totalStartMinutes;

    if (durationMinutes < 0) return 'N/A'; // Should not happen with the above adjustment

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    let durationString = '';
    if (hours > 0) {
      durationString += `${hours}h`;
    }
    if (minutes > 0) {
      durationString += `${hours > 0 ? ' ' : ''}${minutes}min`;
    }
    return durationString || '0min';
  } catch (error) {
    console.error("Error calculating duration in Calendar:", error, { startTime, endTime });
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
      <Text className={`text-sm ${valueColor} ml-8 ${isMultiline ? 'mt-1' : 'mt-0'}`}>{value}</Text>
    </View>
  );

const CalendarScreen = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    lessons: allLessonsFromContext,
    isLoading: lessonsLoading,
    isRefreshing: lessonsRefreshing,
    error: lessonsError,
    fetchCoreData: fetchLessonData
  } = useLessonData();

  const {
    availability: studentAvailability,
    isLoading: availabilityLoading,
    error: availabilityError,
    fetchAvailability,
    addAvailabilitySlot,
    removeAvailabilitySlot
  } = useAvailability();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLessonDetailModalVisible, setLessonDetailModalVisible] = useState(false);
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<Lesson | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return; 

      if (!currentUser?.userId) {
        console.log("CalendarScreen: User not authenticated or student ID missing for initial data fetch.");
        return;
      }
      // Fetch all lessons for the current user
      fetchLessonData(false, currentUser.userId); 
      // Fetch all availability for the current user.
      // The AvailabilityContext's fetchAvailability (without date args) should fetch all.
      fetchAvailability(); 

    }, [authLoading, currentUser?.userId, fetchLessonData, fetchAvailability])
  );


  const onRefresh = useCallback(async () => {
    if (authLoading || !currentUser?.userId) return;
    await fetchLessonData(true, currentUser.userId);
  }, [authLoading, currentUser?.userId, fetchLessonData, selectedDate]);

  // lessonsForSelectedDate, lessonDaysMap, studentAvailableDaysMap will now filter
  // from the comprehensive allLessonsFromContext and studentAvailability data.
  // Their definitions remain the same.
  const lessonsForSelectedDate = useMemo(() => {
    if (!currentUser?.userId) return [];
    return allLessonsFromContext.filter(lesson => {
      try {
        // Ensure lesson.date is valid before parsing
        if (!lesson.date || typeof lesson.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(lesson.date)) {
          console.warn("Invalid lesson date format for lesson:", lesson.id, lesson.date);
          return false;
        }
        const lessonDateObj = parseISO(lesson.date); // date-fns parseISO handles "YYYY-MM-DD"
        return isSameDay(lessonDateObj, selectedDate);
      } catch (e) {
        console.error("Error parsing lesson date in lessonsForSelectedDate:", e, "Lesson:", lesson);
        return false;
      }
    });
  }, [selectedDate, allLessonsFromContext, currentUser?.userId]);

  const lessonDaysMap = useMemo(() => {
    if (!currentUser?.userId) return new Map<string, boolean>();
    const map = new Map<string, boolean>();
    allLessonsFromContext.forEach(lesson => {
      try {
        if (lesson.date && /^\d{4}-\d{2}-\d{2}$/.test(lesson.date)) {
          // Normalize the date string to ensure consistent keys for the map
          const lessonDateKey = format(parseISO(lesson.date), 'yyyy-MM-dd');
          map.set(lessonDateKey, true);
        }
      } catch (e) {
        console.warn("CalendarScreen: Error processing lesson date for lessonDaysMap", lesson, e);
      }
    });
    return map;
  }, [allLessonsFromContext, currentUser?.userId]);

  const studentAvailableDaysMap = useMemo(() => {
    if (!currentUser?.userId) return new Map<string, boolean>();
    const map = new Map<string, boolean>();
    studentAvailability.forEach(slot => {
        map.set(slot.available_date, true);
    });
    return map;
  }, [studentAvailability, currentUser?.userId]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 5; i <= 21; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const slotPixelHeight = 64;

  useEffect(() => {
    // Scroll to current time on today's date
    if (isSameDay(selectedDate, new Date()) && scrollViewRef.current && timeSlots.length > 0) {
      const now = new Date();
      const currentHour = getHours(now);
      const currentMinute = now.getMinutes();
      // Calculate index: each hour has 2 slots (00 and 30)
      const slotIndex = (currentHour * 2) + (currentMinute >= 30 ? 1 : 0);
      // Ensure slotIndex is within bounds of timeSlots (e.g. if current time is before 5 AM)
      const earliestSlotHour = parseInt(timeSlots[0].split(':')[0]);
      if (currentHour >= earliestSlotHour) {
        const adjustedSlotIndex = ((currentHour - earliestSlotHour) * 2) + (currentMinute >= 30 ? 1 : 0);
        const offset = adjustedSlotIndex * slotPixelHeight;
        scrollViewRef.current.scrollTo({ y: offset, animated: true });
      } else {
         scrollViewRef.current.scrollTo({ y: 0, animated: true }); // Scroll to top if before 5 AM
      }
    }
  }, [selectedDate, timeSlots, slotPixelHeight]); 

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date); // Update week view if date picker changes month/year
    hideDatePicker();
    // No data re-fetch needed here as all data is already loaded.
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (!weekDays.some(weekDay => isSameDay(weekDay, date))) {
      setCurrentDate(date);
    }
    if (!isSameDay(date, new Date()) && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
    // No data re-fetch needed here.
  };

  const handlePreviousWeek = () => {
    const newDate = subDays(currentDate, 7);
    setCurrentDate(newDate);
    // No data re-fetch needed here.
  };
  const handleNextWeek = () => {
    const newDate = addDays(currentDate, 7);
    setCurrentDate(newDate);
    // No data re-fetch needed here.
  };

  const handleTimeSlotPress = async (timeSlot: string, lesson?: Lesson) => {
    if (!currentUser?.userId) {
      Alert.alert("Authentication Required", "Please log in to manage your availability.");
      router.push('/(auth)/login'); // Adjust if your login route is different
      return;
    }

    if (lesson) {
      setSelectedLessonForModal(lesson);
      setLessonDetailModalVisible(true);
      return;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const slotDataForApi = { // No user_id here, context adds it
      available_date: formattedDate,
      start_time: timeSlot
    };

    const isSlotCurrentlyMarkedAvailableByStudent = studentAvailability.some(
      s => s.available_date === formattedDate && s.start_time === timeSlot && s.user_id === currentUser.userId
    );

    const now = new Date();
    const [hourStr, minuteStrVal] = timeSlot.split(':');
    const slotHour = parseInt(hourStr, 10);
    const slotMinute = parseInt(minuteStrVal, 10);
    let slotDateTime = setHours(selectedDate, slotHour);
    slotDateTime = setMinutes(slotDateTime, slotMinute);
    slotDateTime = setSeconds(slotDateTime, 0);
    slotDateTime = setMilliseconds(slotDateTime, 0);

    // Prevent marking past slots as available unless it's today
    if (isBefore(slotDateTime, now) && !isSameDay(slotDateTime, now)) {
      if (!isSlotCurrentlyMarkedAvailableByStudent) {
        Alert.alert("Past Slot", "Cannot mark past time slots as available.");
        return;
      }
    }
    
    const slotStartMinutes = slotHour * 60 + slotMinute;
    const slotEndMinutes = slotStartMinutes + 30; // Assuming 30-min slots for availability
    for (const existingLesson of lessonsForSelectedDate) {
        if (existingLesson.startTime === 'N/A') continue;
        const [lessonStartHourStr, lessonStartMinStr] = existingLesson.startTime.split(':');
        const lessonStartMinutes = parseInt(lessonStartHourStr) * 60 + parseInt(lessonStartMinStr);

        if (!existingLesson.endTime || existingLesson.endTime === 'N/A') continue; // Skip if no end time
        const [lessonEndHourStr, lessonEndMinStr] = existingLesson.endTime.split(':');
        const lessonEndMinutes = parseInt(lessonEndHourStr) * 60 + parseInt(lessonEndMinStr);
        
        // Check for overlap
        if (Math.max(slotStartMinutes, lessonStartMinutes) < Math.min(slotEndMinutes, lessonEndMinutes)) {
            Alert.alert("Conflict", "You have a lesson scheduled at this time. Cannot mark as available.");
            return;
        }
    }


    if (isSlotCurrentlyMarkedAvailableByStudent) {
      Alert.alert(
        "Remove Availability",
        "Are you sure you want to mark this time as unavailable?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              await removeAvailabilitySlot(slotDataForApi);
            }
          }
        ]
      );
    } else {
      await addAvailabilitySlot(slotDataForApi);
    }
  };

  const overallIsLoading = authLoading || lessonsLoading || availabilityLoading; 
  const overallIsRefreshing = lessonsRefreshing; 

  if (authLoading) { // Initial check for auth loading
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fb923c" />
        <Text className="mt-2 text-gray-600">Authenticating...</Text>
      </View>
    );
  }

  if (!currentUser?.userId) { // If not authenticated after auth check
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <MaterialCommunityIcons name="lock-outline" size={48} color="#fb923c" />
        <Text className="text-lg font-csemibold text-gray-700 mt-4 mb-2">Authentication Required</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Please log in to view your calendar and manage your availability.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')} // Adjust path to your login screen
          className="bg-orange-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-csemibold text-base">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Authenticated user, now check for data loading
  if (overallIsLoading && !overallIsRefreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fb923c" />
        <Text className="mt-2 text-gray-600">Loading your calendar...</Text>
      </View>
    );
  }

  // Authenticated user, check for errors
  if ((lessonsError || availabilityError) && !overallIsLoading && !overallIsRefreshing) {
     return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#ef4444" />
        <Text className="mt-3 text-red-600 text-center">
            {lessonsError ? `Error loading lessons: ${lessonsError}` : ''}
            {lessonsError && availabilityError ? '\n\n' : ''}
            {availabilityError ? `Error loading your availability: ${availabilityError}` : ''}
        </Text>
        <TouchableOpacity onPress={onRefresh} className="mt-4 bg-orange-500 p-3 rounded-lg">
            <Text className="text-white font-csemibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader />

      <View className="pt-3 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-cbold text-gray-800">My Calendar</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-orange-500 rounded-lg p-2 flex-row items-center"
              onPress={showDatePicker}
            >
              <Text className="font-csemibold text-white m-1">
                {selectedDate ? format(selectedDate, 'dd - MMMM - yyyy') : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {selectedDate && !isSameDay(selectedDate, new Date()) && (
              <TouchableOpacity
                onPress={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setCurrentDate(today);
                }}
                className="ml-2"
                accessibilityLabel="Clear date filter"
              >
                <MaterialCommunityIcons name="close-circle" size={26} color="#f97316" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-center mb-4">
          <TouchableOpacity onPress={handlePreviousWeek} className="pr-2">
            <MaterialCommunityIcons name="chevron-left" size={25} color="#42509A" />
          </TouchableOpacity>
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const hasLessonsForDay = lessonDaysMap.has(dayKey);
            return (
              <DayDateComponent
                key={day.toISOString()}
                date={day}
                isToday={isSameDay(day, new Date())}
                isSelected={isSameDay(day, selectedDate)}
                onPress={handleDateSelect}
                hasLessons={hasLessonsForDay}
              />
            );
          })}
          <TouchableOpacity onPress={handleNextWeek} className="pl-2">
            <MaterialCommunityIcons name="chevron-right" size={25} color="#42509A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-1 pb-5"
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl refreshing={overallIsRefreshing} onRefresh={onRefresh} colors={['#fb923c', '#42509A']} />
        }>
        <View className="flex-row">
          <View className="w-16 pr-2 pt-2">
            {timeSlots.map((time, index) => (
              <View key={time} className={`h-${slotPixelHeight / 4} items-end ${index === 0 ? 'pt-1' : ''}`}>
                <Text className="text-xs text-gray-500 font-cregular">{time}</Text>
              </View>
            ))}
          </View>

          <View className="flex-1 bg-slate-100 rounded-lg">
            {timeSlots.map((time) => {
              const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
              // Use currentUser.userId for checking student's own availability
              const isSlotMarkedAvailableByStudent = currentUser?.userId ? studentAvailability.some(
                s => s.available_date === formattedSelectedDate && s.start_time === time && s.user_id === currentUser.userId
              ) : false;

              // ... (Rest of the slot rendering logic: isPastSlot, lessonForSlot detection) ...
              const [hourStr, minuteStrVal] = time.split(':');
              const currentSlotHour = parseInt(hourStr, 10);
              const currentSlotMinute = parseInt(minuteStrVal, 10);
              const now = new Date();
              let slotDateTime = setHours(selectedDate, currentSlotHour);
              slotDateTime = setMinutes(slotDateTime, currentSlotMinute);
              const isPastSlot = isBefore(slotDateTime, now) && !isSameDay(slotDateTime, now);

              let lessonForSlot: Lesson | undefined = undefined;
              const slotStartMinutes = currentSlotHour * 60 + currentSlotMinute;
              const slotEndMinutes = slotStartMinutes + 30; // Assuming 30-minute slots
              for (const lesson of lessonsForSelectedDate) {
                if(lesson.startTime === 'N/A') continue;
                const [lessonStartHourStr, lessonStartMinStr] = lesson.startTime.split(':');
                const lessonStartMinutes = parseInt(lessonStartHourStr) * 60 + parseInt(lessonStartMinStr);
                if (!lesson.endTime || lesson.endTime === 'N/A') {
                    if (lessonStartMinutes >= slotStartMinutes && lessonStartMinutes < slotEndMinutes) {
                        lessonForSlot = lesson;
                        break;
                    }
                    continue;
                }
                const [lessonEndHourStr, lessonEndMinStr] = lesson.endTime.split(':');
                let lessonEndMinutes = parseInt(lessonEndHourStr) * 60 + parseInt(lessonEndMinStr);
                if (lessonEndMinutes === 0 && lesson.endTime === "00:00") lessonEndMinutes = 24 * 60;
                if (lessonStartMinutes < slotEndMinutes && lessonEndMinutes > slotStartMinutes) {
                  lessonForSlot = lesson;
                  break;
                }
              }

              let slotStyle = 'bg-transparent';
              let slotContent = null;
              let titleForDisplay = lessonForSlot?.title || '';
              if (lessonForSlot?.skillName) {
                titleForDisplay = `${titleForDisplay} (${lessonForSlot.skillName})`;
              }


              if (lessonForSlot) {
                slotStyle = `bg-[#E1BEE8] opacity-80`;
                slotContent = (
                  <Text className="text-[#673172] font-cbold text-center text-xs" numberOfLines={3}>
                    {titleForDisplay}
                  </Text>
                );
              } else if (isSlotMarkedAvailableByStudent) {
                slotStyle = 'bg-green-200';
                slotContent = ( <Text className="text-green-700 font-cbold text-xs">Available</Text> );
              } else {
                if (isPastSlot) {
                  slotStyle = 'bg-gray-50';
                }
              }

              return (
                <TouchableOpacity
                  key={`grid-slot-${time}`}
                  className={`flex-row border-b border-slate-200 h-${slotPixelHeight / 4} items-center justify-center ${slotStyle}`}
                  onPress={() => handleTimeSlotPress(time, lessonForSlot)}
                  disabled={!currentUser?.userId || (!lessonForSlot && isPastSlot && !isSlotMarkedAvailableByStudent)}
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
      {/* ... (DateTimePickerModal and Lesson Detail Modal remain the same) ... */}
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
            setLessonDetailModalVisible(false);
            setSelectedLessonForModal(null);
          }}
        >
          <View className='flex-1 justify-center items-center bg-[#000000aa]'>
            <View className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md relative">
              <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-gray-200">
                <View className="flex-1 mr-2">
                  <Text className="text-xl font-cbold text-gray-800" numberOfLines={1}>{selectedLessonForModal.title}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setLessonDetailModalVisible(false);
                  setSelectedLessonForModal(null);
                }} className="p-1 -mr-3 -mt-5">
                  <MaterialCommunityIcons name="close-circle-outline" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <DetailRow iconName="calendar-blank-outline" label="Date" value={format(parseISO(selectedLessonForModal.date), 'EEEE d MMMM yyyy')} />
              <DetailRow iconName="clock-outline" label="Time" value={`${selectedLessonForModal.startTime}${selectedLessonForModal.endTime && selectedLessonForModal.endTime !== 'N/A' ? ` - ${selectedLessonForModal.endTime}` : ''}`} />
              <DetailRow iconName="timer-sand" label="Duration" value={calculateDuration(selectedLessonForModal.startTime, selectedLessonForModal.endTime)} />
              {selectedLessonForModal.skillName && (
                <DetailRow iconName="lightbulb-on-outline" label="Skill Focus" value={selectedLessonForModal.skillName} />
              )}
              <DetailRow iconName="map-marker-outline" label="Location" value={selectedLessonForModal.location || '-'} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default CalendarScreen;