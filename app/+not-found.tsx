import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../src/ui/primitives';

export default function NotFoundScreen() {
  return <><Stack.Screen options={{ title: '找不到页面' }} /><View style={styles.container}><AppText style={styles.title}>这个页面不存在。</AppText><Link href="/" style={styles.link}>回到首页</Link></View></>;
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: '#FFFFFF' }, title: { fontSize: 22, fontWeight: '500' }, link: { color: '#242120', fontSize: 17 } });
