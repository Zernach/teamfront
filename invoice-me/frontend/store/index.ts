import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import customerReducer from './customerSlice';
import toastReducer from './toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

