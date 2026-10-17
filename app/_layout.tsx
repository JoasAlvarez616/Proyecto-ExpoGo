import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '../src/store/themeStore';
import { initDatabase } from '../src/db';
import { Palette } from '../src/theme/tokens';

export default function RootLayout() {
  const isDark = useThemeStore((state) => state.isDark);
  const colors = useThemeStore((state) => state.colors);
  const loadSavedTheme = useThemeStore((state) => state.loadSavedTheme);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setupApp() {
      try {
        // Cargar tema guardado en preferencias
        await loadSavedTheme();
        // Inicializar base de datos SQLite y semillas iniciales
        initDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Error durante la inicialización de la aplicación:', error);
        setDbReady(true);
      }
    }

    setupApp();
  }, []);

  if (!dbReady) {
    return (
      <View style={[styles.splash, { backgroundColor: Palette.slate900 }]}>
        <ActivityIndicator size="large" color={Palette.cyan400} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="producto/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="producto/nuevo"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="venta/nueva"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="venta/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="cliente/index"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="cliente/nuevo"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
