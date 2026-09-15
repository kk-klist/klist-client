import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useBucketPlaceSearchQuery,
  useBucketRecommendationDetailQuery,
  useBucketRecommendationsQuery,
  useDeleteBucketListMutation,
  useUpdateBucketCompletionMutation,
  useUpdateBucketListMutation,
} from './bucketApi';
import { BucketLocaleProvider } from './BucketLocaleProvider';
import { client } from '@/shared/api/client';
import { getCurrentPosition } from '@/shared/utils/geo';

vi.mock('@/shared/api/client', () => ({
  client: { delete: vi.fn(), get: vi.fn(), patch: vi.fn() },
}));
vi.mock('@/shared/utils/geo', () => ({
  getCurrentPosition: vi.fn(),
}));

function createQueryWrapper(language = 'en') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BucketLocaleProvider language={language}>{children}</BucketLocaleProvider>
    </QueryClientProvider>
  );
}

describe('버킷리스트 TourAPI 요청 언어', () => {
  beforeEach(() => vi.clearAllMocks());

  it('영어 설정이면 추천 요청에 en을 전달한다', async () => {
    getCurrentPosition.mockResolvedValue({ lat: 37.5568, lng: 126.9024 });
    client.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useBucketRecommendationsQuery(), {
      wrapper: createQueryWrapper('en'),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(client.get).toHaveBeenCalledWith('/api/v1/recommend', {
      params: { lat: 37.557, lng: 126.902, lang: 'en' },
    });
  });

  it('영어 설정이면 관광지 상세 요청에 en을 전달한다', async () => {
    client.get.mockResolvedValue({ data: {} });
    const recommendation = { contentId: '123', contentTypeId: '12' };

    const { result } = renderHook(() => useBucketRecommendationDetailQuery(recommendation), {
      wrapper: createQueryWrapper('en'),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.get).toHaveBeenCalledWith('/api/v1/tour/detail/123', {
      params: { contentTypeId: '12', lang: 'en' },
    });
  });

  it('한국어 설정이면 장소 검색 요청에 ko를 전달한다', async () => {
    client.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useBucketPlaceSearchQuery('덕수궁'), {
      wrapper: createQueryWrapper('ko'),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.get).toHaveBeenCalledWith('/api/v1/tour/search', {
      params: { keyword: '덕수궁', lang: 'ko' },
    });
  });
});

describe('useUpdateBucketCompletionMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('완료 상태를 변경하고 버킷 목록과 진행률 캐시를 갱신한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    client.patch.mockResolvedValue(undefined);
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdateBucketCompletionMutation(), { wrapper });

    act(() => {
      result.current.mutate({ bucketListId: 12, isCompleted: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.patch).toHaveBeenCalledWith('/api/v1/bucket-lists/12/completion', {
      isCompleted: true,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bucket'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home', 'bucketProgress'] });
  });
});

describe('버킷리스트 수정 및 삭제 mutation', () => {
  beforeEach(() => vi.clearAllMocks());

  const createWrapper =
    (queryClient) =>
    ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

  it('전체 수정 요청을 보내고 버킷 캐시를 갱신한다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const request = { title: '수정 제목', description: '수정 설명', category: 'K_POP' };
    client.patch.mockResolvedValue({ data: undefined });
    const { result } = renderHook(() => useUpdateBucketListMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => result.current.mutate({ bucketListId: 7, request }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.patch).toHaveBeenCalledWith('/api/v1/bucket-lists/7', request);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bucket'] });
  });

  it('삭제 요청 후 버킷과 홈 진행률 캐시를 갱신한다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    client.delete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteBucketListMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => result.current.mutate(7));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.delete).toHaveBeenCalledWith('/api/v1/bucket-lists/7');
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bucket'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home', 'bucketProgress'] });
  });
});
