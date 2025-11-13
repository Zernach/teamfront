import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

const initialState: ToastState = {
  visible: false,
  message: '',
  type: 'success',
  duration: 3000,
};

export interface ShowToastPayload {
  message: string;
  type?: ToastType;
  duration?: number;
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ShowToastPayload>) => {
      state.visible = true;
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.duration = action.payload.duration || 3000;
    },
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;

