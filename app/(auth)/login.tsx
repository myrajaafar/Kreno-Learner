import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { AdvancedCheckbox } from '../../components/AdvancedCheckBox';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../constants/api';

const LoginScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checked, setChecked] = useState(false);
  const { login } = useAuth(); // Get the login function from context

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    const loginData = {
      action: 'login',
      email: form.email,
      password: form.password
    };

    try {
      const response = await fetch(`${API_BASE_URL}/evaluations_api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const result = await response.json();

      // Check directly for userId and other properties on the result object
      if (response.ok && result.success && result.userId) { 
        await login({ 
          userId: result.userId, 
          email: result.email || '', // Ensure email is provided or handle if optional
          username: result.username || '', // Ensure username is provided
          fullName: result.fullName || '', // API needs to return this if required by User interface
          role: result.role || '' // API needs to return this if required by User interface
        });
        Alert.alert('Login Successful', result.message || 'Welcome back!');
        router.replace('/dashboard');
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials or server error.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 pt-44 items-center bg-white">
      <Image
        source={require('../../assets/images/logo_kreno.png')}
        resizeMode="contain"
        className="w-1/2 h-1/4"
      />
      <Text className="text-gray-600 font-cregular text-[13px] mb-2 w-3/4">Email Address</Text>
      <TextInput
        className="w-3/4 p-3 mb-4 border border-gray-300 rounded-[5px] font-cthin"
        placeholderTextColor={"#00000050"}
        placeholder="myra@gmail.com"
        value={form.email}
        onChangeText={(e) =>setForm({...form, email: e})}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text className="text-gray-600 font-cregular text-[13px] mb-2 w-3/4">Password</Text>
      <TextInput
        className="w-3/4 p-3 mb-4 border border-gray-300 rounded-[5px] font-cthin"
        placeholderTextColor={"#00000050"}
        placeholder="**********"
        value={form.password}
        onChangeText={(e) =>setForm({...form, password: e})}
        secureTextEntry
      />
      <View className="mb-4 w-3/4 flex-row justify-between items-center">
        <AdvancedCheckbox
          value={checked}
          onValueChange={() => setChecked(!checked)}
          label="Keep me signed in"
          labelStyle={{ color: '#000000c0', fontFamily: 'comfortaa', fontSize: 12 }}
          checkedColor="#007AFF"
          uncheckedColor="#000000c0"
          size={13}
        />
      </View>
        <TouchableOpacity
          className="w-3/4 p-3 bg-[#FA7647] rounded-[10px] shadow-gray-600 shadow-md"
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-cbold text-base">SIGN IN</Text>
          )}
        </TouchableOpacity>
        <Text className="absolute bottom-0.5 text-gray-500 font-cthin tracking-[7px]">© KRENO LEARNER</Text>
      </View>
      );
};

export default LoginScreen;