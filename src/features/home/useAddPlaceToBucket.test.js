import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddPlaceToBucketMutation } from './homeApi';
import { useAddPlaceToBucket } from './useAddPlaceToBucket';
import { toast } from '@/shared/utils/toast';

vi.mock('./homeApi', async () => {
  const actual = await vi.importActual('./homeApi');
  return {
    ...actual,
    useAddPlaceToBucketMutation: vi.fn(),
  };
});

vi.mock('@/shared/utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('useAddPlaceToBucket', () => {
  beforeEach(() => vi.clearAllMocks());

  it('장소의 장르로 카테고리를 자동 채우고, 입력한 제목으로 버킷리스트에 담는다', async () => {
    const mutate = vi.fn();
    useAddPlaceToBucketMutation.mockReturnValue({ mutate, isPending: false });
    const place = {
      title: '경복궁',
      addr: '서울 종로구',
      lat: 37.57,
      lng: 126.97,
      genre: 'K-drama',
      thumbnail: 'https://example.com/palace.jpg',
      overview: '<b>한국의 대표 궁궐</b>',
    };
    const { result } = renderHook(() => useAddPlaceToBucket(place, vi.fn()));

    result.current.form.setValue('title', '한복 입고 궁궐 산책하기');
    await act(() => result.current.handleSubmit());

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '한복 입고 궁궐 산책하기',
        description: '한국의 대표 궁궐',
        category: 'K_DRAMA',
        placeName: '경복궁',
        address: '서울 종로구',
        latitude: 37.57,
        longitude: 126.97,
        imageUrl: 'https://example.com/palace.jpg',
      }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('담는 중 연속 제출해도 한 번만 요청한다', async () => {
    const mutate = vi.fn();
    useAddPlaceToBucketMutation.mockReturnValue({ mutate, isPending: false });
    const place = { title: '경복궁', lat: 37.57, lng: 126.97, genre: 'K-drama' };
    const { result } = renderHook(() => useAddPlaceToBucket(place, vi.fn()));

    result.current.form.setValue('title', '경복궁에서 산책하기');
    await act(async () => {
      await Promise.all([result.current.handleSubmit(), result.current.handleSubmit()]);
    });

    expect(mutate).toHaveBeenCalledOnce();
  });

  it('제목이 없으면 요청을 보내지 않는다', async () => {
    const mutate = vi.fn();
    useAddPlaceToBucketMutation.mockReturnValue({ mutate, isPending: false });
    const place = { title: '경복궁', lat: 37.57, lng: 126.97, genre: 'K-drama' };
    const { result } = renderHook(() => useAddPlaceToBucket(place, vi.fn()));

    await act(() => result.current.handleSubmit());

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('title').error?.message).toBe('Please enter a title.');
  });

  it('장르가 없는 장소는 카테고리를 직접 선택해야 한다', async () => {
    const mutate = vi.fn();
    useAddPlaceToBucketMutation.mockReturnValue({ mutate, isPending: false });
    const place = { title: '어느 골목', lat: 37.57, lng: 126.97, genre: null };
    const { result } = renderHook(() => useAddPlaceToBucket(place, vi.fn()));

    result.current.form.setValue('title', '골목 산책하기');
    await act(() => result.current.handleSubmit());

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('category').error?.message).toBe(
      'Please select a category.',
    );
  });

  it('설명이 300자를 넘으면 요청을 보내지 않는다', async () => {
    const mutate = vi.fn();
    useAddPlaceToBucketMutation.mockReturnValue({ mutate, isPending: false });
    const place = { title: '경복궁', lat: 37.57, lng: 126.97, genre: 'K-drama' };
    const { result } = renderHook(() => useAddPlaceToBucket(place, vi.fn()));

    result.current.form.setValue('title', '경복궁에서 산책하기');
    result.current.form.setValue('description', '가'.repeat(301));
    await act(() => result.current.handleSubmit());

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('description').error?.message).toBe(
      'The description must be 300 characters or fewer.',
    );
  });
});
