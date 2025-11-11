import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useUploadBatch } from '../../hooks/api';
import { setActiveJobId, markCompleted, markFailed, updateProgress, setPhotoIdMappings } from '../../store/uploadSlice';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import webSocketClient from '../../services/webSocketClient';
import tokenStorage from '../../services/tokenStorage';
import fileStorage from '../../services/fileStorage';

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
        
        // Issue 5: Better ID mapping - Use photoId first, then fallback to filename
        if (data.photoId && data.progress !== undefined) {
          // First try to find by photoId (most reliable)
          let queueItem = queue.find((item: QueueItem) => item.photoId === data.photoId);
          
          // Fallback to filename if photoId not found
          if (!queueItem && data.filename) {
            queueItem = queue.find((item: QueueItem) => item.fileMetadata.name === data.filename);
          }
          
          // Last resort: match by uploadId (shouldn't happen, but handle it)
          if (!queueItem) {
            queueItem = queue.find((item: QueueItem) => item.id === data.photoId);
          }

          if (queueItem) {
            console.log('[UploadButton] Updating progress for queue item:', queueItem.id, 'to', data.progress);
            dispatch(updateProgress({ id: queueItem.id, progress: data.progress! }));
          } else {
            console.warn('[UploadButton] Could not find queue item for progress update:', {
              photoId: data.photoId,
              filename: data.filename,
              queueItems: queue.map(item => ({ 
                id: item.id, 
                photoId: item.photoId,
                filename: item.fileMetadata.name 
              })),
            });
          }
        }

        // Mark completed photos
        if (data.photoId && data.status === 'completed') {
          let queueItem = queue.find((item: QueueItem) => item.photoId === data.photoId);
          if (!queueItem && data.filename) {
            queueItem = queue.find((item: QueueItem) => item.fileMetadata.name === data.filename);
          }
          if (queueItem) {
            console.log('[UploadButton] Marking queue item as completed:', queueItem.id);
            dispatch(markCompleted({ id: queueItem.id }));
          }
        }

        // Mark failed photos
        if (data.photoId && data.status === 'failed') {
          let queueItem = queue.find((item: QueueItem) => item.photoId === data.photoId);
          if (!queueItem && data.filename) {
            queueItem = queue.find((item: QueueItem) => item.fileMetadata.name === data.filename);
          }
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
      // Issue 4: WebSocket Connection Timing - Connect and wait before upload
      console.log('[UploadButton] Ensuring WebSocket is connected before upload');
      const token = await tokenStorage.getAuthToken();
      if (token) {
        try {
          await webSocketClient.connectAndWait(token, 10000); // 10 second timeout
          console.log('[UploadButton] WebSocket connected successfully');
        } catch (wsError) {
          console.warn('[UploadButton] WebSocket connection failed, continuing with upload:', wsError);
          // Continue with upload even if WebSocket fails - progress updates may be delayed
        }
      } else {
        console.warn('[UploadButton] No auth token for WebSocket, continuing with upload');
      }

      // Retrieve files from file storage using upload IDs
      const uploadIds = queuedFiles.map((item) => item.id);
      const files = fileStorage.getMany(uploadIds);
      
      if (files.length !== queuedFiles.length) {
        const missingFiles = queuedFiles.filter((item) => !fileStorage.has(item.id));
        console.error('[UploadButton] Missing files in storage:', missingFiles.map(item => item.id));
        throw new Error(`Failed to retrieve ${missingFiles.length} file(s) from storage`);
      }
      
      console.log('[UploadButton] Preparing to upload files:', files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })));

      console.log('[UploadButton] Calling uploadBatch.mutateAsync with', files.length, 'files');
      const result = await uploadBatch.mutateAsync(files);
      console.log('[UploadButton] Upload batch mutation completed:', result);

      // Issue 5: Store photoId mappings from response
      if (result.photoIds && Array.isArray(result.photoIds) && result.photoIds.length > 0) {
        const mappings = uploadIds.map((uploadId, index) => ({
          uploadId,
          photoId: result.photoIds[index] || '',
        })).filter(m => m.photoId); // Only include valid mappings
        
        if (mappings.length > 0) {
          console.log('[UploadButton] Storing photoId mappings:', mappings);
          dispatch(setPhotoIdMappings({ mappings }));
        }
      }

      // Set active job ID for WebSocket updates
      if (result.jobId) {
        console.log('[UploadButton] Setting active job ID:', result.jobId);
        dispatch(setActiveJobId({ jobId: result.jobId }));
      } else {
        console.warn('[UploadButton] No jobId in response, progress tracking may be limited');
      }

      // Mark all queued files as uploading
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
        dispatch(markFailed({ id: item?.id, error: errorMessage }));
      });
    }
  }, [hasQueuedFiles, queuedFiles, uploadBatch, dispatch, queue]);

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

