import { configureStore } from '@reduxjs/toolkit';

// Dummy reducer to satisfy Redux requirements
const dummyReducer = (state = {}) => state;

// Minimal store for components that need Redux context
export const store = configureStore({
  reducer: {
    app: dummyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

