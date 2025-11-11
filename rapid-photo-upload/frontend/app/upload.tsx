import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../components/screen';
import { Header } from '../components/header';
import { FileSelectionWithPreview } from '../components/file-selection';
import { UploadQueueWithSummary } from '../components/upload-queue';
import { UploadButton } from '../components/upload-button';
import { COLORS } from '../constants/colors';
import { useAppSelector } from '../hooks/redux';

export default function UploadScreen() {
  const queue = useAppSelector((state) => state.upload.queue);
  const hasQueueItems = queue.length > 0;

  useEffect(() => {
    console.log('[UploadScreen] Component mounted');
    console.log('[UploadScreen] Initial queue state:', {
      queueLength: queue.length,
      hasQueueItems,
      queueItems: queue.map(item => ({
        id: item.id,
        fileName: item.file.name,
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
    });
  }, [queue.length, hasQueueItems]);

  return (
    <Screen style={styles.container}>
      <Header title="Upload Photos" />
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

