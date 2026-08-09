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
  // TODO(임시): 실 로그인 연동 전까지 @LoginUser 인증을 통과시키기 위한 디버그 헤더.
  // 로그인 기능 붙으면 이 블록과 VITE_DEBUG_USER_ID 삭제.
  if (import.meta.env.VITE_DEBUG_USER_ID) {
    config.headers['X-Debug-User-Id'] = import.meta.env.VITE_DEBUG_USER_ID;
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
