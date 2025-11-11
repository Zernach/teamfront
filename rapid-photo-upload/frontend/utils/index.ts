// Utility functions for rapid-photo-upload frontend

import { Platform } from 'react-native';

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  // Handle null/undefined dates
  if (!date) {
    return 'Unknown date';
  }
  
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (!(then instanceof Date) || isNaN(then.getTime())) {
    return 'Invalid date';
  }
  
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return then.toLocaleDateString();
}

/**
 * Validate file type is an image
 */
export function isValidImageFile(file: File): boolean {
  // Handle React Native file objects (with uri property) vs web File objects
  if ('uri' in file && file.uri) {
    // For React Native, check the type property
    return file.type ? file.type.startsWith('image/') : true; // Default to true if type not available
  }
  // Web File object
  return file.type.startsWith('image/');
}

/**
 * Validate file size is within limits
 */
export function isValidFileSize(file: File, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  // Handle React Native file objects (with uri property) vs web File objects
  if ('uri' in file && file.uri) {
    // For React Native, size might be 0 initially, so we'll allow it
    // The actual size will be checked during upload
    return file.size === 0 || file.size <= maxSizeBytes;
  }
  // Web File object
  return file.size <= maxSizeBytes;
}

/**
 * Generate a unique ID for upload queue items
 */
export function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate upload progress percentage
 */
export function calculateProgress(loaded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
}

/**
 * Generate a preview URI for a file that can be used to display the image
 * Works on all platforms: web (blob URL), iOS/Android (file URI)
 */
export function generatePreviewUri(file: File): string | undefined {
  // Handle React Native file objects (with uri property)
  // Type assertion needed because File type doesn't include uri, but React Native files have it
  const fileWithUri = file as File & { uri?: string };
  
  // Always check for uri property first - this indicates React Native
  if (fileWithUri.uri) {
    // React Native - use the uri directly for preview
    return fileWithUri.uri;
  }
  
  // Only create blob URLs on web platform
  // React Native doesn't support URL.createObjectURL even if URL exists
  if (Platform.OS === 'web' && typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      // Double-check it's actually a File instance (not a File-like object)
      if (file instanceof File && !('uri' in file)) {
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('Error creating blob URL for preview:', error);
      return undefined;
    }
  }
  
  return undefined;
}

/**
 * Revoke a preview URI (cleanup blob URLs on web)
 */
export function revokePreviewUri(previewUri: string | undefined): void {
  if (previewUri && typeof URL !== 'undefined' && URL.revokeObjectURL && previewUri.startsWith('blob:')) {
    URL.revokeObjectURL(previewUri);
  }
}

/**
 * Convert image picker result URI to File object (for React Native)
 * This function creates a File-like object that works in both web and React Native.
 * For React Native, it creates an object compatible with FormData.
 * For web, it fetches and creates a proper File object.
 */
export async function imagePickerResultToFile(
  uri: string,
  fileName?: string
): Promise<File> {
  try {
    // Extract file name from URI or use provided name
    const name = fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
    
    // Determine MIME type from file extension or default to image/jpeg
    const getMimeType = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        heic: 'image/heic',
        heif: 'image/heif',
      };
      return mimeTypes[ext || ''] || 'image/jpeg';
    };
    
    const mimeType = getMimeType(name);
    
    // Check platform - React Native doesn't support File API even if types exist
    if (Platform.OS === 'web' && typeof File !== 'undefined' && typeof Blob !== 'undefined') {
      // Web environment - fetch and create proper File object
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], name, { type: blob.type || mimeType });
        return file;
      } catch (fetchError) {
        // If fetch fails (e.g., local file URI), create a File from a blob
        // This handles cases where the URI might be a data URI or local file
        const response = await fetch(uri);
        const blob = await response.blob();
        return new File([blob], name, { type: blob.type || mimeType });
      }
    } else {
      // React Native environment - create File-like object
      // React Native FormData accepts objects with uri, type, and name
      // We'll create a File-like object that works with the upload system
      const fileLike = {
        uri,
        type: mimeType,
        name,
        // Add File API compatibility properties
        size: 0, // Will be determined during upload
        lastModified: Date.now(),
      } as any;
      
      // Add File-like methods for compatibility
      fileLike.toString = () => `[File: ${name}]`;
      fileLike[Symbol.toStringTag] = 'File';
      
      return fileLike as File;
    }
  } catch (error) {
    console.error('Error converting image picker result to file:', error);
    throw new Error('Failed to process selected image');
  }
}

