import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
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
      const formData = new FormData();
      // Handle React Native file objects (with uri property) vs web File objects
      if ('uri' in file && file.uri) {
        // React Native file object
        formData.append('file', file as any);
      } else {
        // Web File object
        formData.append('file', file);
      }
      
      const response = await apiClient.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate photos list to refetch
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
};

export const useUploadBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        // Handle React Native file objects (with uri property) vs web File objects
        if ('uri' in file && file.uri) {
          // React Native file object
          formData.append('files', file as any);
        } else {
          // Web File object
          formData.append('files', file);
        }
      });
      
      const response = await apiClient.post('/photos/upload/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
};
