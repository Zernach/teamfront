import { configureStore } from '@reduxjs/toolkit';

// Minimal store for components that need Redux context
export const store = configureStore({
  reducer: {
    // Add reducers here if needed in the future
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

