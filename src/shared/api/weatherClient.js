import axios from 'axios';

// 날씨(공통) 백엔드는 지도 백엔드(client.js)와 별도 서버라 인스턴스를 분리한다.
// 인터셉터(토큰 첨부/401 처리/에러 unwrap)는 client.js와 동일한 규칙을 따른다.
export const weatherClient = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_BASE_URL,
});

let authHandlers = {
  getToken: () => null,
  onUnauthorized: () => {},
};

export function registerWeatherAuthHandlers(handlers) {
  authHandlers = handlers;
}

weatherClient.interceptors.request.use((config) => {
  const token = authHandlers.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

weatherClient.interceptors.response.use(
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
