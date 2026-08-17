import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../src/ui/primitives';

export default function NotFoundScreen() {
  return <><Stack.Screen options={{ title: '找不到页面' }} /><View style={styles.container}><AppText>这个页面不存在。</AppText><Link href="/">回到首页</Link></View></>;
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 } });
