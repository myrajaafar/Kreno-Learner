import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingScreen" />
            <Stack.Screen name="AccountModification" options={{ title: 'Account Modification' }} />
        </Stack>
    );
}