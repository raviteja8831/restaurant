import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import store from './store';
import {  Stack } from 'expo-router';
import 'react-native-reanimated';

import { AlertProvider } from './services/alertService';

export default function RootLayout() {


  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <AlertProvider>
          <ThemeProvider value={false? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
        </AlertProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
