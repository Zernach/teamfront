import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/screen';
import { Header } from '../components/header';
import { FileSelectionWithPreview } from '../components/file-selection';
import { UploadQueueWithSummary } from '../components/upload-queue';
import { UploadButton } from '../components/upload-button';
import { Toast } from '../components/toast';
import { COLORS } from '../constants/colors';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearQueue } from '../store/uploadSlice';

export default function UploadScreen() {
  const router = useRouter();
  const queue = useAppSelector((state) => state.upload.queue);
  const dispatch = useAppDispatch();
  const hasQueueItems = queue.length > 0;
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const hasShownToastRef = useRef(false);

  // Calculate upload status
  const completed = queue.filter((item) => item.status === 'completed').length;
  const uploading = queue.filter((item) => item.status === 'uploading').length;
  const queued = queue.filter((item) => item.status === 'queued').length;
  const failed = queue.filter((item) => item.status === 'failed').length;
  const allUploadsSuccessful =
    queue.length > 0 &&
    completed === queue.length &&
    uploading === 0 &&
    queued === 0 &&
    failed === 0;

  useEffect(() => {
    console.log('[UploadScreen] Component mounted');
    console.log('[UploadScreen] Initial queue state:', {
      queueLength: queue.length,
      hasQueueItems,
      queueItems: queue.map(item => ({
        id: item.id,
        fileName: item.fileMetadata.name,
        status: item.status,
      })),
    });

    return () => {
      console.log('[UploadScreen] Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('[UploadScreen] Queue updated:', {
      queueLength: queue.length,
      hasQueueItems,
      completed,
      uploading,
      queued,
      failed,
      allUploadsSuccessful,
    });
  }, [queue.length, hasQueueItems, completed, uploading, queued, failed, allUploadsSuccessful]);

  // Detect when all uploads are finished and show success toast
  useEffect(() => {
    if (allUploadsSuccessful && !hasShownToastRef.current) {
      console.log('[UploadScreen] All uploads finished, showing success toast');
      hasShownToastRef.current = true;
      setCompletedCount(completed);
      setShowSuccessToast(true);
    } else if (queue.length === 0) {
      // Reset toast flag when queue is cleared
      hasShownToastRef.current = false;
      setShowSuccessToast(false);
    }
  }, [allUploadsSuccessful, completed, queue.length]);

  const handleToastDismiss = useCallback(() => {
    setShowSuccessToast(false);
    dispatch(clearQueue());
    router.push('/gallery');
  }, [dispatch, router]);

  return (
    <Screen style={styles.container}>
      <Header title="Upload Photos" />
      <Toast
        visible={showSuccessToast}
        message={`Successfully uploaded ${completedCount} photo${completedCount !== 1 ? 's' : ''}! Redirecting to gallery...`}
        type="success"
        duration={3000}
        showCountdown={true}
        onDismiss={handleToastDismiss}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.section}>
          <FileSelectionWithPreview />
        </View>

        {hasQueueItems && (
          <View style={styles.section}>
            <UploadQueueWithSummary />
          </View>
        )}
      </ScrollView>
      <UploadButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    marginBottom: 16,
  },
});
