import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: "700", fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="subject/[slug]"
          options={{
            title: "Subject Curriculum",
            headerBackTitle: "Subjects",
          }}
        />
        <Stack.Screen
          name="webview"
          options={{
            title: "PrepMeUp AI Workbench",
            presentation: "card",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
