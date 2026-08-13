import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import {
  Literata_400Regular,
  Literata_600SemiBold,
} from '@expo-google-fonts/literata';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import MainApp from './src/components/MainApp';
import { Colors } from './src/utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    await Font.loadAsync({
      Literata_400Regular,
      Literata_600SemiBold,
      DMSans_400Regular,
      DMSans_500Medium,
      DMSans_700Bold,
    });
    setReady(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <MainApp />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paper,
    gap: 12,
  },
});
