import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UploadState {
  queue: Array<{
    id: string;
    file: File;
    progress: number;
    status: 'queued' | 'uploading' | 'completed' | 'failed';
    error?: string;
  }>;
  activeJobId: string | null;
}

const initialState: UploadState = {
  queue: [],
  activeJobId: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addToQueue: (state, action: PayloadAction<{ id: string; file: File }>) => {
      state.queue.push({
        id: action.payload.id,
        file: action.payload.file,
        progress: 0,
        status: 'queued',
      });
    },
    updateProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const item = state.queue.find((item) => item?.id === action.payload.id);
      if (item) {
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
} = uploadSlice.actions;
export default uploadSlice.reducer;

