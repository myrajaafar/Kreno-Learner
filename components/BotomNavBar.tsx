import { Tabs } from 'expo-router';
import { Slot } from 'expo-router';
import React, { Children, ReactNode } from 'react'

type Props = {
    children?: ReactNode;
  };

export default function BotomNavBar({ children }: Props) {
    return (
        <>
            {Children}
            <Slot />
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
                    name="../app/(tabs)/dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarLabel: 'DASHBOARD',
                    }}
                />
                <Tabs.Screen
                    name="../app/(tabs)/calendar"
                    options={{
                        title: 'Calendar',
                        tabBarLabel: 'CALENDAR',
                    }}
                />
                <Tabs.Screen
                    name="../app/(tabs)/services"
                    options={{
                        title: 'Services',
                        tabBarLabel: 'SERVICES',
                    }}
                />
                <Tabs.Screen
                    name="../app/(tabs)/theory"
                    options={{
                        title: 'test',
                        tabBarLabel: 'TEST',
                    }}
                />
            </Tabs>
        </>
    )
}