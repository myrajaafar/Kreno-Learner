import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../context/AuthContext';
import { LessonProvider } from '../context/LessonContext';
import { AvailabilityProvider } from '../context/AvailabilityContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Comfortaa-Light': require('../assets/fonts/Comfortaa-Light.ttf'),
    'Comfortaa-Regular': require('../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('../assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-SemiBold': require('../assets/fonts/Comfortaa-SemiBold.ttf'),
    'Comfortaa-Bold': require('../assets/fonts/Comfortaa-Bold.ttf'),
  });
  return (
    <AuthProvider>
      <LessonProvider>
        <AvailabilityProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AvailabilityProvider>
      </LessonProvider>
    </AuthProvider>
  );
}