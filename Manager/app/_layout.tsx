import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {  Stack } from 'expo-router';

import { AlertProvider } from './services/alertService';

export default function RootLayout() {


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <AlertProvider>
            <ThemeProvider value={false? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
          </AlertProvider>
        </PaperProvider>
    </GestureHandlerRootView>
  );
}
