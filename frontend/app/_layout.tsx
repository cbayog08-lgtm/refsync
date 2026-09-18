import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { NoticeOverlay } from "@/src/components/notice-overlay";
import { MatchProvider } from "@/src/context/match";
import { useAppFonts } from "@/src/fonts";
import { queryClient } from "@/src/query-client";

// Disable logbox so users can see the app and agent works as expected.
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000000" }}>
          <SafeAreaProvider>
            <KeyboardProvider>
              <StatusBar style="light" />
              {fontsLoaded ? (
                <MatchProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: "#000000" },
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="match" />
                    <Stack.Screen name="summary" />
                    <Stack.Screen name="history" />
                    <Stack.Screen name="acta/[id]" />
                    <Stack.Screen name="log/goal" options={{ presentation: "modal" }} />
                    <Stack.Screen name="log/card" options={{ presentation: "modal" }} />
                    <Stack.Screen
                      name="log/substitution"
                      options={{ presentation: "modal" }}
                    />
                  </Stack>
                  <NoticeOverlay />
                </MatchProvider>
              ) : (
                <View style={{ flex: 1, backgroundColor: "#000000" }} />
              )}
            </KeyboardProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
