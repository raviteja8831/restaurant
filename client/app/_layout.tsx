import React, { use, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import store from './store';
import { useFonts } from 'expo-font';
import { useRouter, Stack, Slot } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AlertProvider } from './services/alertService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  useEffect(() => {
    if (!loaded) return;
    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/index')) {
      // Delay navigation to ensure layout is mounted
      setTimeout(() => {
        window.location.href = '/Customer-Login';
      }, 0);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <AlertProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Slot />
            </Stack>
          </ThemeProvider>
        </AlertProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
