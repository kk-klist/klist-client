import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// shared는 app/features를 import할 수 없으므로(단방향 import 규칙),
// 토큰 조회·401 처리는 app/store.js가 registerAuthHandlers로 주입한다.
let authHandlers = {
  getToken: () => null,
  onRefresh: async () => null,
  onUnauthorized: () => {},
};

export function registerAuthHandlers(handlers) {
  authHandlers = { ...authHandlers, ...handlers };
}

client.interceptors.request.use((config) => {
  const token = authHandlers.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      if (error.config.url?.includes('/auth/refresh')) {
        authHandlers.onUnauthorized();
        return Promise.reject(error.response.data);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          error.config._retry = true;
          error.config.headers.Authorization = `Bearer ${token}`;
          return client(error.config);
        });
      }

      isRefreshing = true;
      try {
        const token = await authHandlers.onRefresh();
        if (!token) throw new Error('no_token');
        pendingRequests.forEach(({ resolve }) => resolve(token));
        pendingRequests = [];
        error.config._retry = true;
        error.config.headers.Authorization = `Bearer ${token}`;
        return client(error.config);
      } catch {
        pendingRequests.forEach(({ reject }) => reject());
        pendingRequests = [];
        authHandlers.onUnauthorized();
        return Promise.reject(error.response?.data ?? error);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response) {
      return Promise.reject({ code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' });
    }
    return Promise.reject(error.response.data);
  },
);
