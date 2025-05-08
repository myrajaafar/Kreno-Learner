import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { AdvancedCheckbox } from '../../components/AdvancedCheckBox';

const LoginScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const handleLogin = () => {
    router.replace('/dashboard');
  };

  const [checked, setChecked] = useState(false);

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
        >
          <Text className="text-white text-center font-cbold text-base">SIGN IN</Text>
        </TouchableOpacity>
        <Text className="absolute bottom-0.5 text-gray-500 font-cthin tracking-[7px]">© KRENO LEARNER</Text>
      </View>
      );
};

export default LoginScreen;