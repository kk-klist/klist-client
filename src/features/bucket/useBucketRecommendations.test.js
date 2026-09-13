import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBucketRecommendationsQuery } from './bucketApi';
import { useBucketRecommendations } from './useBucketRecommendations';

vi.mock('./bucketApi', () => ({
  useBucketRecommendationsQuery: vi.fn(),
}));

const recommendations = Array.from({ length: 12 }, (_, index) => ({
  contentId: String(index + 1),
  title: `추천 장소 ${index + 1}`,
  distanceMeters: index + 1,
}));

describe('useBucketRecommendations', () => {
  beforeEach(() => {
    useBucketRecommendationsQuery.mockReturnValue({
      data: recommendations,
      isLoading: false,
      isError: false,
    });
  });

  it('페이지 값이 없으면 첫 페이지 추천 목록을 반환한다', () => {
    const { result } = renderHook(() => useBucketRecommendations({ sort: 'DISTANCE' }));

    expect(result.current.currentPage).toBe(0);
    expect(result.current.recommendations).toHaveLength(10);
    expect(result.current.recommendations[0].contentId).toBe('1');
  });

  it('두 번째 페이지면 남은 추천 목록을 반환한다', () => {
    const { result } = renderHook(() => useBucketRecommendations({ sort: 'DISTANCE', page: 1 }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.recommendations).toHaveLength(2);
    expect(result.current.recommendations[0].contentId).toBe('11');
  });
});
