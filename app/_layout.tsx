import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useAuth } from '@/src/hooks';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inGameGroup = segments[0] === '(game)';

    if (!user && !inAuthGroup) {
      router.replace('/');
    } else if (user && (inAuthGroup || !inGameGroup)) {
      router.replace('/hub');
    }
  }, [user, isLoading, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <RootNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
