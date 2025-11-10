import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useUploadBatch } from '../../hooks/api';
import { setActiveJobId, markCompleted, markFailed, updateProgress } from '../../store/uploadSlice';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import webSocketClient from '../../services/webSocketClient';
import tokenStorage from '../../services/tokenStorage';

interface WebSocketProgressData {
  photoId?: string;
  filename?: string;
  progress?: number;
  status?: 'completed' | 'failed' | 'uploading';
  error?: string;
}

type QueueItem = RootState['upload']['queue'][number];

export function UploadButton() {
  const queue = useAppSelector((state: RootState) => state.upload.queue);
  const activeJobId = useAppSelector((state: RootState) => state.upload.activeJobId);
  const dispatch = useAppDispatch();
  const uploadBatch = useUploadBatch();

  const queuedFiles = queue.filter((item: QueueItem) => item.status === 'queued');
  const hasQueuedFiles = queuedFiles.length > 0;
  const isUploading = queue.some((item: QueueItem) => item.status === 'uploading');

  useEffect(() => {
    // Connect WebSocket for real-time updates
    const connectWebSocket = async () => {
      const token = await tokenStorage.getAuthToken();
      if (token) {
        webSocketClient.connect(token);
      }
    };

    connectWebSocket();

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  useEffect(() => {
    // Subscribe to job progress if activeJobId exists
    if (activeJobId) {
      const handleJobProgress = (data: WebSocketProgressData) => {
        // Update individual photo progress
        if (data.photoId && data.progress !== undefined) {
          // Find the queue item by matching file name or ID
          const queueItem = queue.find((item: QueueItem) => {
            // Try to match by photoId if we have a mapping, or by filename
            return item.file.name === data.filename || item?.id === data.photoId;
          });

          if (queueItem) {
            dispatch(updateProgress({ id: queueItem.id, progress: data.progress! }));
          }
        }

        // Mark completed photos
        if (data.photoId && data.status === 'completed') {
          const queueItem = queue.find((item: QueueItem) =>
            item.file.name === data.filename || item?.id === data.photoId
          );
          if (queueItem) {
            dispatch(markCompleted({ id: queueItem.id }));
          }
        }

        // Mark failed photos
        if (data.photoId && data.status === 'failed') {
          const queueItem = queue.find((item: QueueItem) =>
            item.file.name === data.filename || item?.id === data.photoId
          );
          if (queueItem) {
            dispatch(markFailed({ id: queueItem.id, error: data.error || 'Upload failed' }));
          }
        }
      };

      webSocketClient.subscribeToJobProgress(activeJobId, handleJobProgress);

      return () => {
        webSocketClient.unsubscribeFromJobProgress(activeJobId);
      };
    }
  }, [activeJobId, dispatch, queue]);

  const handleUpload = useCallback(async () => {
    if (!hasQueuedFiles) {
      Alert.alert('No files', 'Please select files to upload first');
      return;
    }

    try {
      const files = queuedFiles.map((item) => item.file);

      const result = await uploadBatch.mutateAsync(files);

      // Set active job ID for WebSocket updates
      if (result.jobId) {
        dispatch(setActiveJobId({ jobId: result.jobId }));
      }

      // If the API doesn't return a jobId, we'll need to handle progress differently
      // For now, mark all as uploading
      queuedFiles.forEach((item: QueueItem) => {
        dispatch(updateProgress({ id: item?.id, progress: 0 }));
      });
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to start upload';

      Alert.alert('Upload Failed', errorMessage);

      // Mark all queued files as failed
      queuedFiles.forEach((item: QueueItem) => {
        dispatch(markFailed({ id: item?.id, error: 'Failed to start upload' }));
      });
    }
  }, [hasQueuedFiles, queuedFiles, uploadBatch, dispatch]);

  if (!hasQueuedFiles && !isUploading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={isUploading || uploadBatch.isPending}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isUploading || uploadBatch.isPending
            ? 'Uploading...'
            : `Upload ${queuedFiles.length} file${queuedFiles.length !== 1 ? 's' : ''}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.tan50,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey,
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

