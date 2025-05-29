import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../constants/api';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
  correctOptionId: string;
  category: string;
}

const fetchAIQuestions = async (category: string, userId?: string): Promise<Question[]> => {
  let response, data;
  if (category.toLowerCase() === 'general') {
    // Use the weak spots API for General
    response = await fetch(`${API_BASE_URL}/generate_weak_spots_api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, limit: 2 }),
    });
    data = await response.json();
    console.log('Weak Spots API response:', data);
    if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions.map((q: any, idx: number) => ({
        id: `ai-q${idx + 1}`,
        questionText: q.question,
        options: q.options.map((text: string, i: number) => ({ id: String.fromCharCode(97 + i), text })),
        correctOptionId: String.fromCharCode(97 + q.options.indexOf(q.answer)),
        category: q.category || 'General',
      }));
    }
    throw new Error(data.message || 'Failed to fetch weak spot questions');
  } else {
    // Use the normal AI questions API for specific categories
    response = await fetch(`${API_BASE_URL}/generate_questions_api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, count: 15 }),
    });
    data = await response.json();
    console.log('AI Questions API response:', data);
    if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions.map((q: any, idx: number) => ({
        id: `ai-q${idx + 1}`,
        questionText: q.question,
        options: q.options.map((text: string, i: number) => ({ id: String.fromCharCode(97 + i), text })),
        correctOptionId: String.fromCharCode(97 + q.options.indexOf(q.answer)),
        category,
      }));
    }
    throw new Error(data.message || 'Failed to fetch AI questions');
  }
};

const saveTestResult = async ({
  userId,
  category,
  questions,
  score,
  takenAt,
}: {
  userId: string;
  category: string;
  questions: any[];
  score: number;
  takenAt: string;
}) => {
  await fetch(`${API_BASE_URL}/save_test_result_api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, category, questions, score, takenAt }),
  });
};

const TOTAL_QUESTIONS = 15;

const TheoryTestScreen = () => {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [questionHistory, setQuestionHistory] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all questions on mount
  useEffect(() => {
    if (category) {
      setIsLoading(true);
      fetchAIQuestions(category, currentUser?.userId)
        .then(fetchedQuestions => {
          setQuestions(fetchedQuestions);
          setIsLoading(false);
        })
        .catch(() => {
          Alert.alert('Error', 'Could not load questions.');
          setIsLoading(false);
          if (router.canGoBack()) router.back();
        });
    }
  }, [category, currentUser?.userId]);

  const handleNextQuestion = async () => {
    if (!questions[currentQuestionIndex] || !selectedOptionId) return;

    // Save answer to history
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const updatedHistory = [
      ...questionHistory,
      {
        ...currentQuestion,
        userAnswer: selectedOptionId,
        isCorrect,
      },
    ];
    setQuestionHistory(updatedHistory);
    if (isCorrect) setScore(prev => prev + 1);

    // If last question, save result and go to result screen
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      const takenAt = new Date().toISOString();
      await saveTestResult({
        userId: currentUser?.userId,
        category: category || 'General',
        questions: updatedHistory,
        score: isCorrect ? score + 1 : score,
        takenAt,
      });
      router.replace({
        pathname: '/TheoryTesting/TestResult',
        params: {
          score: (isCorrect ? score + 1 : score).toString(),
          totalQuestions: TOTAL_QUESTIONS.toString(),
          category: category || 'General',
        },
      });
      return;
    }

    // Otherwise, move to next question
    setCurrentQuestionIndex(idx => idx + 1);
    setSelectedOptionId(null);
  };

  const handleSkipQuestion = async () => {
    if (!questions[currentQuestionIndex]) return;

    // Save skipped question to history with no answer
    const currentQuestion = questions[currentQuestionIndex];
    const updatedHistory = [
      ...questionHistory,
      {
        ...currentQuestion,
        userAnswer: null,
        isCorrect: false,
      },
    ];
    setQuestionHistory(updatedHistory);

    // If last question, save result and go to result screen
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      const takenAt = new Date().toISOString();
      await saveTestResult({
        userId: currentUser?.userId,
        category: category || 'General',
        questions: updatedHistory,
        score,
        takenAt,
      });
      router.replace({
        pathname: '/TheoryTesting/TestResult',
        params: {
          score: score.toString(),
          totalQuestions: TOTAL_QUESTIONS.toString(),
          category: category || 'General',
        },
      });
      return;
    }

    // Otherwise, move to next question
    setCurrentQuestionIndex(idx => idx + 1);
    setSelectedOptionId(null);
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
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
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  if (isLoading || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-2xl font-cbold text-orange-500">Loading Questions...</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Category Header */}
      <View className="flex-row items-center p-5 bg-[#42509A17] rounded-b-[50px] mb-4 pt-16">
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
          {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
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
          <Text className="text-white text-center font-cbold text-base">
            {currentQuestionIndex + 1 >= TOTAL_QUESTIONS ? 'FINISH' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TheoryTestScreen;