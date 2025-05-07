import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('myra@gmail.com');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleLogin = () => {
    router.replace('/dashboard');
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Image
        source={""}
        className="w-24 h-24 bg-gray-500 rounded-full mb-8"
      />
      <TextInput
        className="w-3/4 p-2 mb-4 border border-gray-300 rounded"
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="w-3/4 p-2 mb-4 border border-gray-300 rounded"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-3/4 p-2 mb-4"
        onPress={() => setAcceptedTerms(!acceptedTerms)}
      >
        <Text>
          <Text className="text-gray-600">☐ </Text>
          <Text className="text-gray-600">I accept the Terms and Conditions</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-3/4 p-3 bg-orange-500 rounded"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-bold">SIGN IN</Text>
      </TouchableOpacity>
      <Text className="absolute bottom-4 text-gray-500">© KRENO</Text>
    </View>
  );
};

export default LoginScreen;