import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomHeader from "../../components/CustomHeader";
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

const AccountModification = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser?.userId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    // Only send fields that have changed
    const payload: any = { userId: currentUser.userId };
    if (email && email !== currentUser.email) payload.email = email;
    if (password) payload.password = password;

    if (!payload.email && !payload.password) {
      Alert.alert('Nothing to update', 'Please change your email or password before saving.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('http://192.168.1.51/kreno-api/update_profile_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Profile updated successfully! Please login again.', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
    setSaving(false);
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader showSettingsIcon={false} />
      <View className='flex-1 p-4'>
        <Text className="text-2xl font-cbold text-gray-800 mb-6">Modify Profile</Text>
        <Text className="mb-2 text-gray-700 font-cmedium">Enter Your New Email</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-4 font-cregular text-sm"
          placeholder="Enter new email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text className="mb-2 text-gray-700 font-cmedium">Enter Your New Password</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-6 font-cregular text-sm"
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          className={`bg-orange-500 rounded-lg py-3 ${saving ? 'opacity-50' : ''}`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white text-center font-bold text-base font-cbold">
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AccountModification;