import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeatherOutfitQuery } from './weatherApi';
import authReducer, { setUser } from '@/features/auth/authSlice';
import { weatherClient } from '@/shared/api/weatherClient';
import { getCurrentPosition } from '@/shared/utils/geo';

vi.mock('@/shared/api/weatherClient', () => ({
  weatherClient: { get: vi.fn() },
}));
vi.mock('@/shared/utils/geo', () => ({
  getCurrentPosition: vi.fn(),
}));

function createWrapper(user) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user, accessToken: user ? 'token' : null } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  return { store, wrapper };
}

describe('복장 추천 요청 언어', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentPosition.mockResolvedValue({ lat: 37.5665, lng: 126.978 });
    weatherClient.get.mockResolvedValue({ data: { weather: {}, outfit: {} } });
  });

  it('영어 설정이면 복장 추천 요청에 lang=en을 전달한다', async () => {
    const { wrapper } = createWrapper({ preferredLanguage: 'en' });

    const { result } = renderHook(() => useWeatherOutfitQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(weatherClient.get).toHaveBeenCalledWith('/weather/outfit', {
      params: { latitude: 37.5665, longitude: 126.978, lang: 'en' },
    });
  });

  it('한국어 설정이면 lang=ko를 전달한다', async () => {
    const { wrapper } = createWrapper({ preferredLanguage: 'ko' });

    const { result } = renderHook(() => useWeatherOutfitQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(weatherClient.get.mock.calls[0][1].params.lang).toBe('ko');
  });

  it('로그인하지 않았거나 지원하지 않는 언어면 lang=ko를 전달한다', async () => {
    const { wrapper } = createWrapper(null);

    const { result } = renderHook(() => useWeatherOutfitQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(weatherClient.get.mock.calls[0][1].params.lang).toBe('ko');
  });

  it('언어를 바꾸면 새 언어로 다시 요청한다', async () => {
    const { store, wrapper } = createWrapper({ preferredLanguage: 'ko' });
    const { result } = renderHook(() => useWeatherOutfitQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => {
      store.dispatch(setUser({ preferredLanguage: 'en' }));
    });

    await waitFor(() => expect(weatherClient.get).toHaveBeenCalledTimes(2));
    expect(weatherClient.get.mock.calls[1][1].params.lang).toBe('en');
  });
});
