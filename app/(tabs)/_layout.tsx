import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#f3f4f6',
          borderTopColor: '#d1d5db',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          color: '#4b5563',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'DASHBOARD',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarLabel: 'CALENDAR',
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarLabel: 'SERVICES',
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'test',
          tabBarLabel: 'TEST',
        }}
      />
    </Tabs>
  );
}