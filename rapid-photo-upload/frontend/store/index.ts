import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uploadReducer, { removeFromQueue, clearQueue, UploadState } from './uploadSlice';
import fileStorage from '../services/fileStorage';
import { revokePreviewUri } from '../utils';

// Middleware to clean up file storage and preview URIs when items are removed from queue
const fileStorageCleanupMiddleware: Middleware = (store) => (next) => (action) => {
  if (removeFromQueue.match(action)) {
    // Get the item before it's removed to clean up its preview URI
    const state = store.getState() as { upload: UploadState };
    const item = state.upload.queue.find((queueItem) => queueItem.id === action.payload.id);
    if (item?.fileMetadata.previewUri) {
      revokePreviewUri(item.fileMetadata.previewUri);
    }
    // Clean up file from storage
    fileStorage.remove(action.payload.id);
  } else if (clearQueue.match(action)) {
    // Clean up all preview URIs and files when queue is cleared
    const state = store.getState() as { upload: UploadState };
    state.upload.queue.forEach((item) => {
      if (item.fileMetadata.previewUri) {
        revokePreviewUri(item.fileMetadata.previewUri);
      }
    });
    fileStorage.clear();
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(fileStorageCleanupMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
