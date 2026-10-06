import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionLoading(false);
      
      const isLoginScreen = segments[0] === 'login';
      
      if (session && isLoginScreen) {
        // Si tiene sesión y está en login, lo metemos en la app
        router.replace('/(tabs)');
      } else if (!session && !isLoginScreen) {
        // Si no tiene sesión y está intentando ver algo, lo echamos al login
        router.replace('/login');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const isLoginScreen = segments[0] === 'login';
      
      if (session && isLoginScreen) {
        router.replace('/(tabs)');
      } else if (!session && !isLoginScreen) {
        router.replace('/login');
      }
    });
  }, [segments]);

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
