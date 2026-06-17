import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontMap } from '../lib/fonts';
import { useProfilesStore } from '../store/profiles';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontMap);
  // Wait for persisted profiles so the active profile is correct on first paint.
  const profilesHydrated = useProfilesStore((s) => s.hydrated);
  const ready = fontsLoaded && profilesHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f7f6f3' },
        }}
      >
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
