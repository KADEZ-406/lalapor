import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme, Platform, Alert } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const text = message ? `${title}\n\n${message}` : title;
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(text);
      if (confirmed) {
        const confirmButton = buttons.find(b => b.style !== 'cancel' && b.text !== 'Batal' && b.text !== 'Cancel') || buttons[1];
        if (confirmButton && confirmButton.onPress) {
          confirmButton.onPress();
        }
      } else {
        const cancelButton = buttons.find(b => b.style === 'cancel' || b.text === 'Batal' || b.text === 'Cancel') || buttons[0];
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      window.alert(text);
      if (buttons && buttons.length > 0) {
        const okButton = buttons[0];
        if (okButton && okButton.onPress) {
          okButton.onPress();
        }
      }
    }
  };
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if current route is protected or public
    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'laporan';

    if (!user && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access app pages
      router.replace('/login');
    } else if (user && (segments[0] === 'login' || segments[0] === 'register' || segments[0] === undefined)) {
      // Redirect to dashboard/home if authenticated and on login/register/landing
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="register" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="laporan/[id]" options={{ headerShown: true, title: 'Detail Laporan', headerTintColor: '#2563eb' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
