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

  it('불러온 모든 추천 목록을 거리순으로 반환한다', () => {
    const { result } = renderHook(() => useBucketRecommendations({ sort: 'DISTANCE' }));

    expect(result.current.recommendations).toHaveLength(12);
    expect(result.current.recommendations[0].contentId).toBe('1');
  });

  it('이전 페이지 URL이 있어도 목록을 잘라내지 않는다', () => {
    const { result } = renderHook(() => useBucketRecommendations({ sort: 'DISTANCE', page: 1 }));

    expect(result.current.recommendations).toHaveLength(12);
    expect(result.current.recommendations[0].contentId).toBe('1');
  });

  it('여러 페이지의 동일 장소를 중복 표시하지 않는다', () => {
    useBucketRecommendationsQuery.mockReturnValue({
      data: [recommendations[0], recommendations[0]],
    });
    const { result } = renderHook(() => useBucketRecommendations({ sort: 'DISTANCE' }));
    expect(result.current.recommendations).toHaveLength(1);
  });
});
