import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Comfortaa-Light': require('../assets/fonts/Comfortaa-Light.ttf'),
    'Comfortaa-Regular': require('../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Medium': require('../assets/fonts/Comfortaa-Medium.ttf'),
    'Comfortaa-SemiBold': require('../assets/fonts/Comfortaa-SemiBold.ttf'),
    'Comfortaa-Bold': require('../assets/fonts/Comfortaa-Bold.ttf'),
  });
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login"  />
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="service-details/[id]" options={{ title: 'Service Details' }} />
      <Stack.Screen name="account-modification" options={{ title: 'Account Modification' }} />
    </Stack>
  );
}