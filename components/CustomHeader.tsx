// filepath: d:\Kreno\components\CustomHeader.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';

const firstName = 'Myra';
const lastName = 'Jaafar';

const PROFILE_PIC_URL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=BDBDBD&color=fff`;

const CustomHeader = () => {
  return (
    <View className="flex-row items-center p-7 bg-[#42509A17] rounded-b-[50px] mb-4">
      <Image
        source={{ uri: PROFILE_PIC_URL }}
        className="w-10 h-10 rounded-full mr-3"
      />
      <View>
        <Text className="text-[#42509A] font-cbold text-lg">{firstName} {lastName}</Text>
        <Text className="text-[#A8ACB4] font-cregular text-sm">Student</Text>
      </View>
    </View>
  );
};

export default CustomHeader;