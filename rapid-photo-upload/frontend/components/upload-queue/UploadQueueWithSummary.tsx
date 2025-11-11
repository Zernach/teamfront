import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../hooks/redux';
import { UploadQueue } from './UploadQueue';
import { COLORS } from '../../constants/colors';

export function UploadQueueWithSummary() {
  const queue = useAppSelector((state) => state.upload.queue);
  
  const completed = queue.filter((item) => item.status === 'completed').length;
  const failed = queue.filter((item) => item.status === 'failed').length;
  const uploading = queue.filter((item) => item.status === 'uploading').length;
  const queued = queue.filter((item) => item.status === 'queued').length;
  
  const totalSize = queue.reduce((sum, item) => sum + item.fileMetadata.size, 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{queue.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Completed</Text>
          <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{completed}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Uploading</Text>
          <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{uploading}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Failed</Text>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>{failed}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Queued</Text>
          <Text style={styles.summaryValue}>{queued}</Text>
        </View>
      </View>
      <UploadQueue />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: COLORS.background99,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tan50,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
});

