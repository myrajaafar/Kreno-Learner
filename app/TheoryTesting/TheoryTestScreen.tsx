import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router'; // Assuming Expo Router for navigation and params
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define the structure for a question and its options
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
  correctOptionId: string;
  category: string; // To ensure questions match the category
}

// Placeholder for AI-generated questions
// In a real app, you would fetch this from your backend/AI service
const fetchAIQuestions = async (category: string, count: number = 15): Promise<Question[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Example placeholder questions - REPLACE WITH ACTUAL AI INTEGRATION
  const placeholderQuestions: Question[] = Array.from({ length: count }, (_, i) => ({
    id: `${category}-q${i + 1}`,
    category: category,
    questionText: `This is AI-generated question ${i + 1} for the category "${category}". What is the correct answer?`,
    options: [
      { id: 'a', text: `Option A for Q${i + 1}` },
      { id: 'b', text: `Option B for Q${i + 1}` },
      { id: 'c', text: `Option C for Q${i + 1}` },
      { id: 'd', text: `Option D for Q${i + 1}` },
    ],
    correctOptionId: 'b', // Example: Option B is always correct for placeholders
  }));
  return placeholderQuestions;
};

const TheoryTestScreen = () => {
  const { category } = useLocalSearchParams<{ category: string }>(); // Get category from navigation params
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (category) {
      setIsLoading(true);
      fetchAIQuestions(category)
        .then(fetchedQuestions => {
          setQuestions(fetchedQuestions);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch questions:", error);
          setIsLoading(false);
          Alert.alert("Error", "Could not load questions. Please try again.");
          // Optionally navigate back or show an error message
        });
    } else {
      Alert.alert("Error", "No category selected.");
      if (router.canGoBack()) router.back();
    }
  }, [category]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const moveToNextOrEnd = () => {
    setSelectedOptionId(null); // Reset selection for next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOptionId === questions[currentQuestionIndex].correctOptionId) {
      setScore(prevScore => prevScore + 1);
    }

    setSelectedOptionId(null); // Reset selection for next question

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // End of the test
      setShowResults(true);
    }
  };

  const handleSkipQuestion = () => {
    // Skipping does not affect the score
    moveToNextOrEnd();
  };

  const handleExitTest = () => {
    Alert.alert(
      "Exit Test",
      "Are you sure you want to exit the test? Your progress will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              // Fallback if router.back() is not possible (e.g., deep link)
              router.replace('/'); // Or navigate to a specific home/categories screen
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-2xl font-cbold text-orange-500">Loading Questions...</Text>
      </SafeAreaView>
    );
  }

  if (showResults) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-purple-50 p-5">
        <Text className="text-2xl font-cbold text-purple-800 mb-4">Test Completed!</Text>
        <Text className="text-xl text-purple-700 mb-2">Category: {category}</Text>
        <Text className="text-xl text-purple-700 mb-6">Your Score: {score} / {questions.length}</Text>
        <TouchableOpacity
          className="bg-orange-500 px-8 py-3 rounded-lg shadow-md"
          onPress={() => {
            // Reset state and navigate or offer retry
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedOptionId(null);
            setShowResults(false);
            // Potentially re-fetch questions or navigate to categories screen
            if(router.canGoBack()) router.back(); else router.replace('/'); 
          }}
        >
          <Text className="text-white font-csemibold text-lg">Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (questions.length === 0 && !isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-purple-50">
        <Text className="text-lg text-red-500">No questions available for this category.</Text>
        <TouchableOpacity
          className="mt-4 bg-orange-500 px-6 py-2 rounded-lg"
          onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}
        >
          <Text className="text-white font-csemibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Category Header */}
      <View className="flex-row items-center p-5 bg-[#42509A17] rounded-b-[50px] mb-4">
        <View className="flex-1">
          <Text className="text-2xl font-cbold text-[#42509A] ml-2">{currentQuestion.category}</Text>
        </View>
        <TouchableOpacity onPress={handleExitTest} className="p-2">
          <Text className="text-orange-500 font-cbold text-lg">Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Question Counter */}
        <Text className="text-orange-500 font-csemibold text-lg my-4">
          {currentQuestionIndex + 1} / {questions.length}
        </Text>

        {/* Question Text */}
        <Text className="text-2xl font-cbold text-gray-800 mb-8">
          {currentQuestion.questionText}
        </Text>

        {/* Options Container */}
        <View className="bg-[#42509A17] p-5 rounded-2xl shadow">
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`py-4 px-3 rounded-xl mb-3 shadow
                ${selectedOptionId === option.id ? 'bg-[#42509A] ' : 'bg-orange-500 '}
                active:bg-[#42509A]`}
              onPress={() => handleOptionSelect(option.id)}
            >
              <Text className="text-white text-center font-cmedium text-base">{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Buttons Area */}
      <View className="p-7 border-t border-slate-200 flex-row justify-between items-center">
        {/* Skip Button */}
        <TouchableOpacity
          className="py-3 px-6 rounded-xl w-[25%] shadow-md bg-gray-300 active:bg-gray-400"
          onPress={handleSkipQuestion}
        >
          <Text className="text-gray-700 text-center font-cbold text-base">SKIP</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          className={`py-3 px-8 rounded-xl w-[72%] shadow-md 
            ${!selectedOptionId ? 'bg-gray-400' : 'bg-orange-500 active:bg-orange-600'}`}
          onPress={handleNextQuestion}
          disabled={!selectedOptionId}
        >
          <Text className="text-white text-center font-cbold text-base">NEXT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TheoryTestScreen;