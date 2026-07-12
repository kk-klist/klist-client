import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// shared는 app/features를 import할 수 없으므로(단방향 import 규칙),
// 토큰 조회·401 처리는 app/store.js가 registerAuthHandlers로 주입한다.
let authHandlers = {
  getToken: () => null,
  onUnauthorized: () => {},
};

export function registerAuthHandlers(handlers) {
  authHandlers = handlers;
}

client.interceptors.request.use((config) => {
  const token = authHandlers.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      authHandlers.onUnauthorized();
    }
    if (!error.response) {
      return Promise.reject({ code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' });
    }
    return Promise.reject(error.response.data);
  },
);
