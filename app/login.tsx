import { Stack } from 'expo-router';
import LoginScreen from '../src/components/Authentication/LoginScreen';
import "../global.css"

export default function Login() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginScreen />
    </>
  );
}