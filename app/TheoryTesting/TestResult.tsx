import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TestResultsScreen = () => {
  const { score, totalQuestions, category } = useLocalSearchParams<{ score: string, totalQuestions: string, category: string }>();

  const numericScore = parseInt(score || '0', 10);
  const numericTotalQuestions = parseInt(totalQuestions || '0', 10);

  const handleDone = () => {
    // Navigate to the main theory test tab or categories screen
    router.replace('/(tabs)/theory'); 
  };

  const getPerformanceMessage = () => {
    if (numericTotalQuestions === 0) return "No questions were attempted.";
    const percentage = (numericScore / numericTotalQuestions) * 100;
    if (percentage >= 80) return "Excellent work! You've mastered this category.";
    if (percentage >= 60) return "Good job! A little more practice will make perfect.";
    if (percentage >= 40) return "You're getting there! Keep practicing.";
    return "Keep trying! Review the material and try again.";
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: "Test Results", headerShown: false, headerBackVisible: false }} />
      
      <View className="flex-1 justify-center items-center px-6 pt-8">
        <MaterialCommunityIcons name="trophy-variant-outline" size={80} color="#fb923c" className="mb-5" />
        
        <Text className="text-3xl font-cbold text-[#42509A] mb-3 text-center">Test Completed!</Text>
        
        <Text className="text-lg text-gray-700 mb-1 text-center">Category: {category}</Text>
        <Text className="text-2xl font-csemibold text-[#42509A] mb-4 text-center">
          Your Score: {numericScore} / {numericTotalQuestions}
        </Text>
        
        <View className="my-4 p-4 bg-[#E8EAF6] rounded-lg w-full items-center shadow-sm">
          <Text className="text-base font-cmedium text-[#42509A] text-center">{getPerformanceMessage()}</Text>
        </View>
      </View>

      <View className="px-6 pb-8 pt-4 border-t border-slate-200">
        <TouchableOpacity
          className="bg-orange-500 w-full py-3.5 rounded-lg shadow-md mb-3"
          onPress={handleDone}
        >
          <Text className="text-white font-csemibold text-lg text-center">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TestResultsScreen;