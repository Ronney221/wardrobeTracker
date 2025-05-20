import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { getColor } from '@/src/constants/theme';
import { WardrobeProvider } from '@/src/context/WardrobeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const CustomDefaultTheme: typeof DefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: getColor('pinkBarbie', 'light'),
      background: getColor('bgScreen', 'light'),
      card: getColor('bgCard', 'light'),
      text: getColor('textPrimary', 'light'),
      border: getColor('border', 'light'),
      notification: getColor('pinkRaspberry', 'light'),
    },
  };

  const CustomDarkTheme: typeof DarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: getColor('pinkBarbie', 'dark'),
      background: getColor('bgScreen', 'dark'),
      card: getColor('bgCard', 'dark'),
      text: getColor('textPrimary', 'dark'),
      border: getColor('border', 'dark'),
      notification: getColor('pinkRaspberry', 'dark'),
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <WardrobeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </WardrobeProvider>
    </ThemeProvider>
  );
}
