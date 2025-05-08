import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function TabsLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(66, 80, 154, 0.35)',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#42509A',
        tabBarInactiveTintColor: '#4C4E58',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Comfortaa-Bold',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({focused}) => (
            <Image 
              source={focused
                ? require('../../assets/icons/dashboard-active.png')
                : require('../../assets/icons/dashboard-inactive.png')}
              className='w-6 h-6'
              resizeMode="contain"
            />
          )
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({focused}) => (
            <Image 
            source={focused
              ? require('../../assets/icons/calendar-active.png')
              : require('../../assets/icons/calendar-inactive.png')}
              className='w-6 h-6'
              resizeMode="contain"
            />
          )
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarLabel: 'Services',
          tabBarIcon: ({focused}) => (
            <Image 
            source={focused
              ? require('../../assets/icons/services-active.png')
              : require('../../assets/icons/services-inactive.png')}
              className='w-6 h-6'
              resizeMode="contain"
            />
          )
        }}
      />
      <Tabs.Screen
        name="theory"
        options={{
          title: 'test',
          tabBarLabel: 'Testing',
          tabBarIcon: ({focused}) => (
            <Image 
            source={focused
              ? require('../../assets/icons/test-active.png')
              : require('../../assets/icons/test-inactive.png')}
              className='w-6 h-6'
              resizeMode="contain"
            />
          )
        }}
      />
    </Tabs>
  );
}