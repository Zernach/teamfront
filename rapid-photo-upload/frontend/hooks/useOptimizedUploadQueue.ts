import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  updateProgress,
  markCompleted,
  markFailed,
  setPhotoIdMapping,
} from '../store/uploadSlice';
import { useUploadPhoto } from './api';

/**
 * Optimized upload queue manager for UI responsiveness.
 * 
 * PERFORMANCE REQUIREMENTS:
 * - Handle 100 concurrent uploads without blocking UI
 * - Maintain 30+ FPS during upload operations
 * - Limit browser-side concurrency to prevent UI blocking
 * - Throttle progress updates to avoid excessive re-renders
 * 
 * IMPLEMENTATION STRATEGY:
 * - Process uploads in batches (5 concurrent max on browser)
 * - Backend handles true concurrency (50 threads)
 * - Throttle progress updates to 100ms intervals
 * - Use requestAnimationFrame for smooth UI updates
 */

const MAX_CONCURRENT_UPLOADS = 5; // Browser-side limit
const PROGRESS_THROTTLE_MS = 100; // Update UI max once per 100ms

interface UseOptimizedUploadQueueOptions {
  autoStart?: boolean;
  maxConcurrent?: number;
}

export const useOptimizedUploadQueue = (
  options: UseOptimizedUploadQueueOptions = {}
) => {
  const {
    autoStart = true,
    maxConcurrent = MAX_CONCURRENT_UPLOADS,
  } = options;

  const dispatch = useAppDispatch();
  const queue = useAppSelector((state) => state.upload.queue);
  const uploadPhoto = useUploadPhoto();

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  // Track last progress update time for throttling
  const lastProgressUpdate = useRef<Record<string, number>>({});
  const rafId = useRef<number | null>(null);

  /**
   * Throttled progress update using requestAnimationFrame for smooth UI.
   */
  const updateProgressThrottled = useCallback(
    (uploadId: string, progress: number) => {
      const now = Date.now();
      const lastUpdate = lastProgressUpdate.current[uploadId] || 0;

      // Only update if throttle period has passed
      if (now - lastUpdate >= PROGRESS_THROTTLE_MS) {
        lastProgressUpdate.current[uploadId] = now;

        // Use RAF for smooth UI updates
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }

        rafId.current = requestAnimationFrame(() => {
          dispatch(updateProgress({ id: uploadId, progress }));
        });
      }
    },
    [dispatch]
  );

  /**
   * Process a single file upload.
   */
  const processUpload = useCallback(
    async (item: (typeof queue)[0]) => {
      if (!item || item.status !== 'queued') {
        return;
      }

      setActiveUploads((prev) => prev + 1);

      try {
        console.log(`[UploadQueue] Starting upload: ${item.id}`);

        // Convert fileMetadata back to File object for upload
        const file = await fetch(item.fileMetadata.previewUri || item.fileMetadata.uri!)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new File([blob], item.fileMetadata.name, {
                type: item.fileMetadata.type,
              })
          );

        // Upload with progress tracking
        const result = await uploadPhoto.mutateAsync(file, {
          onProgress: (progress) => {
            updateProgressThrottled(item.id, progress);
          },
        } as any);

        // Mark complete
        dispatch(markCompleted({ id: item.id }));

        // Store photoId mapping if available
        if (result?.photoId) {
          dispatch(
            setPhotoIdMapping({
              uploadId: item.id,
              photoId: result.photoId,
            })
          );
        }

        console.log(`[UploadQueue] Upload completed: ${item.id}`);
      } catch (error: any) {
        console.error(`[UploadQueue] Upload failed: ${item.id}`, error);
        dispatch(
          markFailed({
            id: item.id,
            error: error.message || 'Upload failed',
          })
        );
      } finally {
        setActiveUploads((prev) => prev - 1);
      }
    },
    [dispatch, uploadPhoto, updateProgressThrottled]
  );

  /**
   * Process queue in batches to maintain UI responsiveness.
   */
  const processQueue = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      while (true) {
        // Get queued items
        const queuedItems = queue.filter((item) => item.status === 'queued');

        if (queuedItems.length === 0) {
          console.log('[UploadQueue] Queue empty, stopping processor');
          break;
        }

        // Wait if at max concurrency
        if (activeUploads >= maxConcurrent) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }

        // Process next batch
        const batch = queuedItems.slice(0, maxConcurrent - activeUploads);
        console.log(
          `[UploadQueue] Processing batch: ${batch.length} uploads (${activeUploads} active, ${queuedItems.length} queued)`
        );

        // Start uploads in parallel (non-blocking)
        batch.forEach((item) => processUpload(item));

        // Small delay to prevent tight loop
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [queue, activeUploads, maxConcurrent, isProcessing, processUpload]);

  /**
   * Auto-start processing when queue has items.
   */
  useEffect(() => {
    if (autoStart && !isProcessing && queue.some((item) => item.status === 'queued')) {
      processQueue();
    }
  }, [autoStart, isProcessing, queue, processQueue]);

  /**
   * Cleanup RAF on unmount.
   */
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  /**
   * Get queue statistics.
   */
  const stats = {
    total: queue.length,
    queued: queue.filter((i) => i.status === 'queued').length,
    uploading: queue.filter((i) => i.status === 'uploading').length,
    completed: queue.filter((i) => i.status === 'completed').length,
    failed: queue.filter((i) => i.status === 'failed').length,
    active: activeUploads,
  };

  /**
   * Calculate overall progress.
   */
  const overallProgress =
    queue.length > 0
      ? Math.round(
          (queue.reduce((sum, item) => sum + item.progress, 0) / queue.length)
        )
      : 0;

  return {
    isProcessing,
    activeUploads,
    stats,
    overallProgress,
    startProcessing: processQueue,
  };
};

