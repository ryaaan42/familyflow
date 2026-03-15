import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProvider } from "../src/hooks/app-context";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProvider>
  );
}
