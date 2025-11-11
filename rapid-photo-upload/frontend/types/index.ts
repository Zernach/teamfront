// Type definitions for rapid-photo-upload frontend

export interface User {
  id: string;
  username: string;
  email: string;
  storageQuota: number;
  usedStorage: number;
}

export interface Photo {
  id: string;
  filename: string;
  fileSize: number;
  contentType: string;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  storageKey: string;
  thumbnailStorageKey?: string;
  uploadedAt: string;
  uploadedByUserId: string;
  tags: string[];
  width?: number;
  height?: number;
  fileHash?: string;
}

export interface UploadJob {
  id: string;
  userId: string;
  photoIds: string[];
  totalPhotos: number;
  completedPhotos: number;
  failedPhotos: number;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIALLY_FAILED' | 'FAILED';
  progressPercentage: number;
  createdAt: string;
  completedAt?: string;
}

export interface PhotoListResponse {
  photos: Photo[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}

export interface BatchUploadResponse {
  jobId: string;
  totalPhotos: number;
  photoIds: string[];
}

