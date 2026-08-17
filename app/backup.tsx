import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackupRepository } from '../src/data/repositories/backup-repository';
import { MAX_BACKUP_BYTES } from '../src/domain/backup';
import { BackupService } from '../src/services/backup-service';
import { AppText, Card, InlineError, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../src/ui/primitives';
import { spacing, typography } from '../src/theme/tokens';

export default function BackupScreen() {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingJson, setPendingJson] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ backupVersion: number; sessions: number; distractions: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const service = new BackupService(new BackupRepository(db));

  const exportBackup = async () => {
    setBusy(true); setError(null); setStatus(null);
    try {
      const { json } = await service.create();
      const date = new Date().toISOString().slice(0, 10);
      const uri = `${FileSystem.documentDirectory}immersion-backup-${date}.json`;
      await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: '导出 Immersion 备份' });
      else setStatus(`备份已保存：${uri}`);
    } catch { setError('导出失败，现有本地数据未改变。'); }
    finally { setBusy(false); }
  };

  const pickBackup = async () => {
    setBusy(true); setError(null); setStatus(null); setPreview(null); setPendingJson(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (!fileInfo.exists || fileInfo.isDirectory) throw new Error('选择的备份文件无法读取。');
      if (fileInfo.size > MAX_BACKUP_BYTES) throw new Error('备份文件超过 5 MB 上限。');
      const json = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const validation = await service.validate(json);
      if (!validation.ok) throw new Error(validation.error);
      setPendingJson(json);
      setPreview({ backupVersion: validation.value.backupVersion, sessions: validation.value.sessions.length, distractions: validation.value.distractions.length });
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取备份失败。'); }
    finally { setBusy(false); }
  };

  const importBackup = async () => {
    if (!pendingJson) return;
    setBusy(true); setError(null);
    try {
      const result = await service.merge(pendingJson);
      setStatus(`导入完成：新增 ${result.insertedSessions} 个 session、${result.insertedDistractions} 个念头；跳过 ${result.skippedSessions + result.skippedDistractions} 条相同记录。`);
      setPreview(null); setPendingJson(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : '导入失败，数据库已回滚。'); }
    finally { setBusy(false); }
  };

  return <Screen scroll>
    <SectionTitle>数据迁移</SectionTitle>
    <AppText muted style={{ marginTop: spacing.xs }}>数据只保存在设备上。导出文件由你自行保存或发送到另一台设备。</AppText>
    <Card><AppText style={styles.heading}>导出</AppText><AppText muted style={styles.copy}>生成版本化 JSON，并打开系统分享面板；不会自动上传。</AppText><PrimaryButton onPress={() => void exportBackup()} disabled={busy}>导出备份</PrimaryButton></Card>
    <Card><AppText style={styles.heading}>导入</AppText><AppText muted style={styles.copy}>先完整校验，再预览，最后以事务方式合并。冲突会中止，不覆盖本地数据。</AppText><SecondaryButton onPress={() => void pickBackup()} disabled={busy}>选择备份文件</SecondaryButton>{preview ? <View style={styles.preview}><AppText>备份版本：{preview.backupVersion}</AppText><AppText>sessions：{preview.sessions}</AppText><AppText>念头：{preview.distractions}</AppText><PrimaryButton onPress={() => void importBackup()} disabled={busy}>确认导入</PrimaryButton></View> : null}</Card>
    {status ? <AppText style={{ color: '#356859' }}>{status}</AppText> : null}
    {error ? <InlineError>{error}</InlineError> : null}
  </Screen>;
}

const styles = StyleSheet.create({ heading: { ...typography.heading, marginBottom: spacing.sm }, copy: { marginBottom: spacing.md }, preview: { marginTop: spacing.md, gap: spacing.xs }, });
