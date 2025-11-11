import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppSelector } from '../../hooks/redux';
import { formatFileSize } from '../../utils';
import { COLORS } from '../../constants/colors';

export function UploadQueue() {
  const queue = useAppSelector((state) => state.upload.queue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.primary;
      case 'failed':
        return COLORS.red;
      case 'uploading':
        return COLORS.primary;
      default:
        return COLORS.grey;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued':
        return 'Queued';
      case 'uploading':
        return 'Uploading';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  if (queue.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No files in upload queue</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload Queue ({queue.length})</Text>
      {queue.map((item) => (
        <View key={item?.id} style={styles.queueItem}>
          <View style={styles.queueItemHeader}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.fileMetadata.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          {item.status === 'uploading' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          )}

          {item.status === 'failed' && item.error && (
            <Text style={styles.errorText}>{item.error}</Text>
          )}

          <Text style={styles.fileSize}>{formatFileSize(item.fileMetadata.size)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.grey,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.white,
  },
  queueItem: {
    backgroundColor: COLORS.background99,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.tan50,
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
    color: COLORS.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.tan50,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.grey,
    minWidth: 40,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red,
    marginTop: 4,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 4,
  },
});
