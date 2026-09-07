import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateBucketListMutation } from './bucketApi';
import { useAddBucketRecommendation } from './useAddBucketRecommendation';
import { toast } from '@/shared/utils/toast';

vi.mock('./bucketApi', () => ({
  useCreateBucketListMutation: vi.fn(),
}));

vi.mock('@/shared/utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('useAddBucketRecommendation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('사용자가 입력한 제목과 자동 분류된 카테고리로 추천 장소를 추가한다', async () => {
    const mutate = vi.fn();
    useCreateBucketListMutation.mockReturnValue({ mutate, isPending: false });
    const recommendation = {
      title: '경복궁',
      address: '서울 종로구',
      latitude: 37.57,
      longitude: 126.97,
      category: 'K_DRAMA',
    };
    const detail = {
      title: '경복궁',
      overview: '<b>한국의 대표 궁궐</b>',
      imageUrl: 'https://example.com/palace.jpg',
    };
    const { result } = renderHook(() =>
      useAddBucketRecommendation(recommendation, detail, vi.fn()),
    );

    result.current.form.setValue('title', '한복 입고 궁궐 산책하기');
    await act(() => result.current.handleSubmit());

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '한복 입고 궁궐 산책하기',
        description: '한국의 대표 궁궐',
        category: 'K_DRAMA',
      }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('추가 요청 중 연속 제출해도 한 번만 요청한다', async () => {
    const mutate = vi.fn();
    useCreateBucketListMutation.mockReturnValue({ mutate, isPending: false });
    const recommendation = {
      title: '경복궁',
      category: 'K_DRAMA',
      latitude: 37.57,
      longitude: 126.97,
    };
    const { result } = renderHook(() => useAddBucketRecommendation(recommendation, null, vi.fn()));

    result.current.form.setValue('title', '경복궁에서 산책하기');
    await act(async () => {
      await Promise.all([result.current.handleSubmit(), result.current.handleSubmit()]);
    });

    expect(mutate).toHaveBeenCalledOnce();
  });

  it('제목이 없으면 추가 요청을 보내지 않는다', async () => {
    const mutate = vi.fn();
    useCreateBucketListMutation.mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() =>
      useAddBucketRecommendation(
        { title: '경복궁', category: 'K_DRAMA', latitude: 37.57, longitude: 126.97 },
        null,
        vi.fn(),
      ),
    );

    await act(() => result.current.handleSubmit());

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('title').error?.message).toBe('Please enter a title.');
  });
});
