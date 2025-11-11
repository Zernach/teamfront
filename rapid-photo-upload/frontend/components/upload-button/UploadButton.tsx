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
      console.log('[UploadButton] Initializing WebSocket connection');
      const token = await tokenStorage.getAuthToken();
      if (token) {
        console.log('[UploadButton] Auth token found, connecting WebSocket');
        webSocketClient.connect(token);
      } else {
        console.warn('[UploadButton] No auth token found, skipping WebSocket connection');
      }
    };

    connectWebSocket();

    return () => {
      // Don't disconnect on unmount - keep connection alive
      console.log('[UploadButton] Component unmounting, keeping WebSocket connection alive');
    };
  }, []);

  useEffect(() => {
    // Subscribe to job progress if activeJobId exists
    if (activeJobId) {
      console.log('[UploadButton] Subscribing to job progress for jobId:', activeJobId);
      const handleJobProgress = (data: WebSocketProgressData) => {
        console.log('[UploadButton] Received WebSocket progress update:', data);
        // Update individual photo progress
        if (data.photoId && data.progress !== undefined) {
          // Find the queue item by matching file name or ID
          const queueItem = queue.find((item: QueueItem) => {
            // Try to match by photoId if we have a mapping, or by filename
            return item.file.name === data.filename || item?.id === data.photoId;
          });

          if (queueItem) {
            console.log('[UploadButton] Updating progress for queue item:', queueItem.id, 'to', data.progress);
            dispatch(updateProgress({ id: queueItem.id, progress: data.progress! }));
          } else {
            console.warn('[UploadButton] Could not find queue item for progress update:', {
              photoId: data.photoId,
              filename: data.filename,
              queueItems: queue.map(item => ({ id: item.id, filename: item.file.name })),
            });
          }
        }

        // Mark completed photos
        if (data.photoId && data.status === 'completed') {
          const queueItem = queue.find((item: QueueItem) =>
            item.file.name === data.filename || item?.id === data.photoId
          );
          if (queueItem) {
            console.log('[UploadButton] Marking queue item as completed:', queueItem.id);
            dispatch(markCompleted({ id: queueItem.id }));
          }
        }

        // Mark failed photos
        if (data.photoId && data.status === 'failed') {
          const queueItem = queue.find((item: QueueItem) =>
            item.file.name === data.filename || item?.id === data.photoId
          );
          if (queueItem) {
            console.log('[UploadButton] Marking queue item as failed:', queueItem.id, data.error);
            dispatch(markFailed({ id: queueItem.id, error: data.error || 'Upload failed' }));
          }
        }
      };

      webSocketClient.subscribeToJobProgress(activeJobId, handleJobProgress);

      return () => {
        console.log('[UploadButton] Unsubscribing from job progress for jobId:', activeJobId);
        webSocketClient.unsubscribeFromJobProgress(activeJobId);
      };
    } else {
      console.log('[UploadButton] No activeJobId, skipping WebSocket subscription');
    }
  }, [activeJobId, dispatch, queue]);

  const handleUpload = useCallback(async () => {
    console.log('[UploadButton] Upload button clicked');
    console.log('[UploadButton] Queue state:', {
      totalItems: queue.length,
      queuedFiles: queuedFiles.length,
      isUploading,
      uploadBatchPending: uploadBatch.isPending,
    });

    if (!hasQueuedFiles) {
      console.warn('[UploadButton] No queued files, showing alert');
      Alert.alert('No files', 'Please select files to upload first');
      return;
    }

    try {
      const files = queuedFiles.map((item) => item.file);
      console.log('[UploadButton] Preparing to upload files:', files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })));

      console.log('[UploadButton] Calling uploadBatch.mutateAsync with', files.length, 'files');
      const result = await uploadBatch.mutateAsync(files);
      console.log('[UploadButton] Upload batch mutation completed:', result);

      // Set active job ID for WebSocket updates
      if (result.jobId) {
        console.log('[UploadButton] Setting active job ID:', result.jobId);
        dispatch(setActiveJobId({ jobId: result.jobId }));
      } else {
        console.warn('[UploadButton] No jobId in response, progress tracking may be limited');
      }

      // If the API doesn't return a jobId, we'll need to handle progress differently
      // For now, mark all as uploading
      console.log('[UploadButton] Marking all queued files as uploading');
      queuedFiles.forEach((item: QueueItem) => {
        dispatch(updateProgress({ id: item?.id, progress: 0 }));
      });
    } catch (error: unknown) {
      console.error('[UploadButton] Upload error caught:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to start upload';

      console.error('[UploadButton] Error details:', {
        message: errorMessage,
        error,
      });

      Alert.alert('Upload Failed', errorMessage);

      // Mark all queued files as failed
      console.log('[UploadButton] Marking all queued files as failed');
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
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '600',
  },
});

