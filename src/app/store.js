import { configureStore } from '@reduxjs/toolkit';
import { registerAuthHandlers } from '@/shared/api/client';
import authReducer, { logout } from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

registerAuthHandlers({
  getToken: () => store.getState().auth.accessToken,
  onUnauthorized: () => store.dispatch(logout()),
});
