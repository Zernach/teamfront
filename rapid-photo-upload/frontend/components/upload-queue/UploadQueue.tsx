import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateProgress, markCompleted, markFailed } from '../../store/uploadSlice';
import { useUploadPhoto, useUploadBatch } from '../../hooks/api';
import { formatFileSize } from '../../utils';
import webSocketClient from '../../services/webSocketClient';

export function UploadQueue() {
  const queue = useAppSelector((state) => state.upload.queue);
  const activeJobId = useAppSelector((state) => state.upload.activeJobId);
  const dispatch = useAppDispatch();
  const uploadPhoto = useUploadPhoto();
  const uploadBatch = useUploadBatch();

  useEffect(() => {
    // Connect WebSocket for real-time updates
    const token = typeof window !== 'undefined' 
      ? window.localStorage.getItem('auth_token')
      : null;
    
    if (token) {
      webSocketClient.connect(token);
    }

    return () => {
      webSocketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    // Subscribe to job progress if activeJobId exists
    if (activeJobId) {
      const handleJobProgress = (data: any) => {
        // Update individual photo progress
        if (data.photoId && data.progress !== undefined) {
          dispatch(updateProgress({ id: data.photoId, progress: data.progress }));
        }
        
        // Mark completed photos
        if (data.photoId && data.status === 'completed') {
          dispatch(markCompleted({ id: data.photoId }));
        }
        
        // Mark failed photos
        if (data.photoId && data.status === 'failed') {
          dispatch(markFailed({ id: data.photoId, error: data.error || 'Upload failed' }));
        }
      };

      webSocketClient.subscribeToJobProgress(activeJobId, handleJobProgress);

      return () => {
        webSocketClient.unsubscribeFromJobProgress(activeJobId);
      };
    }
  }, [activeJobId, dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#f44336';
      case 'uploading':
        return '#2196F3';
      default:
        return '#9E9E9E';
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
        <View key={item.id} style={styles.queueItem}>
          <View style={styles.queueItemHeader}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.file.name}
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
          
          <Text style={styles.fileSize}>{formatFileSize(item.file.size)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  queueItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

