import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  uri?: string; // For React Native files (used for upload)
  previewUri?: string; // URI for displaying preview (blob URL on web, uri on native)
}

export interface UploadState {
  queue: Array<{
    id: string;
    fileMetadata: FileMetadata;
    progress: number;
    status: 'queued' | 'uploading' | 'completed' | 'failed';
    error?: string;
    photoId?: string; // Backend photo ID (UUID) - set after upload starts
  }>;
  activeJobId: string | null;
  photoIdMapping: Record<string, string>; // Maps uploadId -> photoId
}

const initialState: UploadState = {
  queue: [],
  activeJobId: null,
  photoIdMapping: {},
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addToQueue: (state, action: PayloadAction<{ id: string; fileMetadata: FileMetadata }>) => {
      state.queue.push({
        id: action.payload.id,
        fileMetadata: action.payload.fileMetadata,
        progress: 0,
        status: 'queued',
      });
    },
    updateProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const item = state.queue.find((item) => item?.id === action.payload.id);
      if (item) {
        // Don't update progress or change status if already completed or failed
        if (item.status === 'completed' || item.status === 'failed') {
          return;
        }
        item.progress = action.payload.progress;
        item.status = 'uploading';
      }
    },
    markCompleted: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.queue.find((item) => item?.id === action.payload.id);
      if (item) {
        item.status = 'completed';
        item.progress = 100;
      }
    },
    markFailed: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const item = state.queue.find((item) => item?.id === action.payload.id);
      if (item) {
        item.status = 'failed';
        item.error = action.payload.error;
      }
    },
    removeFromQueue: (state, action: PayloadAction<{ id: string }>) => {
      state.queue = state.queue.filter((item) => item?.id !== action.payload.id);
    },
    setActiveJobId: (state, action: PayloadAction<{ jobId: string | null }>) => {
      state.activeJobId = action.payload.jobId;
    },
    clearQueue: (state) => {
      state.queue = [];
      state.activeJobId = null;
      state.photoIdMapping = {};
    },
    // Issue 10: Error State Recovery - Retry mechanism
    retryUpload: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.queue.find((i) => i.id === action.payload.id);
      if (item && item.status === 'failed') {
        item.status = 'queued';
        item.error = undefined;
        item.progress = 0;
      }
    },
    // Issue 5: Upload ID vs Photo ID Mismatch - Store photoId mapping
    setPhotoIdMapping: (state, action: PayloadAction<{ uploadId: string; photoId: string }>) => {
      state.photoIdMapping[action.payload.uploadId] = action.payload.photoId;
      const item = state.queue.find((i) => i.id === action.payload.uploadId);
      if (item) {
        item.photoId = action.payload.photoId;
      }
    },
    setPhotoIdMappings: (state, action: PayloadAction<{ mappings: Array<{ uploadId: string; photoId: string }> }>) => {
      action.payload.mappings.forEach(({ uploadId, photoId }) => {
        state.photoIdMapping[uploadId] = photoId;
        const item = state.queue.find((i) => i.id === uploadId);
        if (item) {
          item.photoId = photoId;
        }
      });
    },
  },
});

export const {
  addToQueue,
  updateProgress,
  markCompleted,
  markFailed,
  removeFromQueue,
  setActiveJobId,
  clearQueue,
  retryUpload,
  setPhotoIdMapping,
  setPhotoIdMappings,
} = uploadSlice.actions;
export default uploadSlice.reducer;

