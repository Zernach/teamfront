import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '../services/tokenStorage';

export interface AuthState {
    user: {
        id: string;
        email: string;
        role?: string;
        permissions?: string[];
    } | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{ user: AuthState['user']; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            // Persist token to storage (web: localStorage, native: AsyncStorage)
            tokenStorage.setAuthToken(action.payload.token).catch(console.error);
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            // Clear token from storage
            tokenStorage.clearAuthToken().catch(console.error);
            tokenStorage.clearRefreshToken().catch(console.error);
        },
        initializeAuth: (state, action: PayloadAction<{ user: AuthState['user']; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
    },
});

export const { setAuth, clearAuth, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

