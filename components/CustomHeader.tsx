import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { router } from 'expo-router'; 

const firstName = 'Myra';
const lastName = 'Jaafar';

const PROFILE_PIC_URL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=BDBDBD&color=fff`;

interface CustomHeaderProps {
  showSettingsIcon?: boolean;
  onSettingsPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ showSettingsIcon, onSettingsPress }) => {
  const handlePress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else if (showSettingsIcon) {
      router.push("/Settings/SettingScreen");
    }
  };

  return (
    <View className="flex-row items-center p-7 bg-[#42509A17] rounded-b-[50px] mb-4">
      <Image
        source={{ uri: PROFILE_PIC_URL }}
        className="mr-3"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
        }}
        onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
      />
      <View className="flex-1">
        <Text className="text-[#42509A] font-cbold text-lg">{firstName} {lastName}</Text>
        <Text className="text-[#A8ACB4] font-cregular text-sm">Student</Text>
      </View>
      {showSettingsIcon && (
        <TouchableOpacity onPress={handlePress} className="p-2">
          <MaterialCommunityIcons name="cog-outline" size={28} color="#FF6347" />
          </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomHeader;