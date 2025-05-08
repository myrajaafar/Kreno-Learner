import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Calendar = () => {
  return (
    <SafeAreaView>
      <View>
        <Text className='text-4xl'>CalendarScreen</Text>
      </View>
    </SafeAreaView>
  )
}

export default Calendar