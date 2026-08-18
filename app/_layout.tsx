import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ImmersionDatabaseProvider } from '../src/data/database';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <ImmersionDatabaseProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        contentStyle: { backgroundColor: '#FFFFFF' },
        headerBackTitle: '返回',
        headerShown: true,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#242120',
        headerTitleStyle: { fontSize: 18, fontWeight: '500' },
        headerShadowVisible: false,
      }}>
        <Stack.Screen name="index" options={{ title: 'Immersion', headerShown: false }} />
        <Stack.Screen name="focus/[id]" options={{ title: '沉浸中', headerBackVisible: false }} />
        <Stack.Screen name="review/[id]" options={{ title: '回顾本次沉浸', headerBackVisible: false }} />
        <Stack.Screen name="history/index" options={{ title: '历史' }} />
        <Stack.Screen name="history/[id]" options={{ title: '记录详情' }} />
        <Stack.Screen name="backup" options={{ title: '数据迁移' }} />
      </Stack>
    </ImmersionDatabaseProvider>
  );
}
