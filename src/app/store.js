import { configureStore } from '@reduxjs/toolkit';
import { registerAuthHandlers } from '@/shared/api/client';
import { registerWeatherAuthHandlers } from '@/shared/api/weatherClient';
import authReducer, { logout } from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

const authHandlers = {
  getToken: () => store.getState().auth.accessToken,
  onUnauthorized: () => store.dispatch(logout()),
};

registerAuthHandlers(authHandlers);
registerWeatherAuthHandlers(authHandlers);
