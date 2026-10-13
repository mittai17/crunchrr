import "../global.css";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, Redirect, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ApiProvider } from "../src/context";
import { useState, useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
function Authenticated() {
  const dark = useColorScheme() === "dark";
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: AsyncStorage,
        key: `crunchrr-safe-cache-${userId || "signed-out"}`,
      }),
    [userId],
  );
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60000, retry: 1 } },
      }),
    [userId],
  );
  if (!isLoaded) return null;
  if (!isSignedIn && segments[0] !== "sign-in")
    return <Redirect href="/sign-in" />;
  return (
    <PersistQueryClientProvider
      key={userId || "signed-out"}
      client={client}
      persistOptions={{
        persister,
        buster: userId || "signed-out",
        maxAge: 86400000,
        dehydrateOptions: {
          shouldDehydrateQuery: (q) =>
            q.queryKey[0] === "module" &&
            ["task", "note", "shopping", "habit", "event"].includes(
              String(q.queryKey[1]),
            ),
        },
      }}
    >
      <ApiProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: dark ? "#080b14" : "#f6f7fb" },
            headerTintColor: "#6d3df5",
            headerTitleStyle: { color: dark ? "#f1f5f9" : "#111827" },
            contentStyle: { backgroundColor: dark ? "#080b14" : "#f6f7fb" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen
            name="create"
            options={{ presentation: "modal", title: "Quick add" }}
          />
          <Stack.Screen
            name="record/[id]"
            options={{ title: "Connected record" }}
          />
          <Stack.Screen name="module/[kind]" options={{ title: "Your life" }} />
        </Stack>
        <StatusBar style="auto" />
      </ApiProvider>
    </PersistQueryClientProvider>
  );
}
export default function Layout() {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) throw new Error("Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={key} tokenCache={tokenCache}>
          <ClerkLoaded>
            <Authenticated />
          </ClerkLoaded>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
