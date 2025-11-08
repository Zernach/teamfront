// Utility functions for rapid-photo-upload frontend

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
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
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
    
    // Check if we're in a web environment (File API available)
    if (typeof File !== 'undefined' && typeof Blob !== 'undefined') {
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

