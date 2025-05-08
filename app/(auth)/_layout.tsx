import React from 'react'
import { Stack } from 'expo-router'
import "../../global.css"
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AuthLayout() {
    return (
        <SafeAreaView className="flex-1 bg-white">
        <Stack screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name="login" />
        </Stack>
        </SafeAreaView>
    )
}