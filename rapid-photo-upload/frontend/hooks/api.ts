import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient, { apiClient as apiClientInstance } from '../services/apiClient';
import { Photo, PhotoListResponse, UploadJob } from '../types';

/**
 * React Query hooks for photo operations.
 */
export const usePhotos = (page: number = 0, pageSize: number = 20) => {
  return useQuery<PhotoListResponse>({
    queryKey: ['photos', page, pageSize],
    queryFn: async () => {
      const response = await apiClient.get('/photos', {
        params: { page, pageSize },
      });
      return response.data;
    },
  });
};

export const usePhotosInfinite = (pageSize: number = 20) => {
  return useInfiniteQuery<PhotoListResponse>({
    queryKey: ['photos', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get('/photos', {
        params: { page: pageParam, pageSize },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
};

export const usePhoto = (photoId: string) => {
  return useQuery<Photo>({
    queryKey: ['photo', photoId],
    queryFn: async () => {
      const response = await apiClient.get(`/photos/${photoId}`);
      return response.data;
    },
    enabled: !!photoId,
  });
};

export const useUploadJob = (jobId: string) => {
  return useQuery<UploadJob>({
    queryKey: ['uploadJob', jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if job is in progress
      const data = query.state.data;
      if (data?.status === 'IN_PROGRESS' || data?.status === 'CREATED') {
        return 2000;
      }
      return false;
    },
  });
};

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      console.log('[Upload] Starting single photo upload');
      console.log('[Upload] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        hasUri: 'uri' in file,
      });

      const formData = new FormData();
      // Handle React Native file objects (with uri property) vs web File objects
      if ('uri' in file && file.uri) {
        // React Native file object
        console.log('[Upload] Using React Native file object with URI:', file.uri);
        formData.append('file', file as any);
      } else {
        // Web File object
        console.log('[Upload] Using Web File object');
        formData.append('file', file);
      }

      // Use upload client with extended timeout (5 minutes)
      const uploadClient = apiClientInstance.getUploadClient(300000);
      console.log('[Upload] Created upload client with 5 minute timeout');

      const uploadUrl = '/photos/upload';
      console.log('[Upload] Sending POST request to:', uploadUrl);
      console.log('[Upload] FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
        key,
        valueType: typeof value,
        valueSize: value instanceof File ? value.size : 'N/A',
      })));

      try {
        const response = await uploadClient.post(uploadUrl, formData, {
          // Don't set Content-Type header - axios will set it automatically with boundary
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        console.log('[Upload] Upload successful:', {
          status: response.status,
          data: response.data,
        });
        return response.data;
      } catch (error: any) {
        console.error('[Upload] Upload failed:', {
          message: error.message,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
          } : null,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            timeout: error.config.timeout,
          } : null,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[Upload] Upload mutation succeeded, invalidating photos list');
      // Invalidate photos list to refetch
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error) => {
      console.error('[Upload] Upload mutation error:', error);
    },
    retry: 2, // Retry failed uploads up to 2 times
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
      console.log(`[Upload] Retrying upload (attempt ${attemptIndex + 1}), delay: ${delay}ms`);
      return delay;
    },
  });
};

export const useUploadBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      console.log('[Upload] Starting batch upload');
      console.log('[Upload] Batch details:', {
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        files: files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          hasUri: 'uri' in f,
        })),
      });

      const formData = new FormData();
      files.forEach((file, index) => {
        // Handle React Native file objects (with uri property) vs web File objects
        if ('uri' in file && file.uri) {
          // React Native file object
          console.log(`[Upload] Adding file ${index + 1}/${files.length} (RN):`, file.name, file.uri);
          formData.append('files', file as any);
        } else {
          // Web File object
          console.log(`[Upload] Adding file ${index + 1}/${files.length} (Web):`, file.name);
          formData.append('files', file);
        }
      });

      // Calculate timeout based on number of files (5 minutes per file, max 30 minutes)
      const timeoutMs = Math.min(300000 * files.length, 1800000);
      console.log('[Upload] Calculated timeout:', timeoutMs, 'ms (', timeoutMs / 60000, 'minutes)');

      // Use upload client with extended timeout
      const uploadClient = apiClientInstance.getUploadClient(timeoutMs);
      console.log('[Upload] Created upload client with extended timeout');

      const uploadUrl = '/photos/upload/batch';
      console.log('[Upload] Sending POST request to:', uploadUrl);
      console.log('[Upload] FormData file count:', Array.from(formData.entries()).filter(([key]) => key === 'files').length);

      try {
        const startTime = Date.now();
        const response = await uploadClient.post(uploadUrl, formData, {
          // Don't set Content-Type header - axios will set it automatically with boundary
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        const duration = Date.now() - startTime;
        console.log('[Upload] Batch upload successful:', {
          status: response.status,
          data: response.data,
          duration: `${duration}ms`,
        });
        return response.data;
      } catch (error: any) {
        console.error('[Upload] Batch upload failed:', {
          message: error.message,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          } : null,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            timeout: error.config.timeout,
            baseURL: error.config.baseURL,
          } : null,
          stack: error.stack,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[Upload] Batch upload mutation succeeded, invalidating photos list');
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error) => {
      console.error('[Upload] Batch upload mutation error:', error);
    },
    retry: 1, // Retry failed batch uploads once (batch uploads are expensive to retry)
    retryDelay: (attemptIndex) => {
      console.log(`[Upload] Retrying batch upload (attempt ${attemptIndex + 1}), delay: 3000ms`);
      return 3000; // Wait 3 seconds before retry
    },
  });
};
