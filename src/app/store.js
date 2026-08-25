import { configureStore } from '@reduxjs/toolkit';
import { registerAuthHandlers } from '@/shared/api/client';
import { registerWeatherAuthHandlers } from '@/shared/api/weatherClient';
import authReducer, { logout, setCredentials } from '@/features/auth/authSlice';
import { refreshAccessToken } from '@/features/auth/authApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

const authHandlers = {
  getToken: () => store.getState().auth.accessToken,
  onRefresh: async () => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return null;
    const { accessToken } = await refreshAccessToken(rt);
    store.dispatch(setCredentials({ accessToken, user: null }));
    return accessToken;
  },
  onUnauthorized: () => store.dispatch(logout()),
};

registerAuthHandlers(authHandlers);
registerWeatherAuthHandlers(authHandlers);
