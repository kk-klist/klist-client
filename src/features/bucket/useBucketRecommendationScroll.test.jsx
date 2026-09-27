import { render, act, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBucketRecommendationsQuery } from './bucketApi';
import { useBucketRecommendations } from './useBucketRecommendations';

vi.mock('./bucketApi', () => ({ useBucketRecommendationsQuery: vi.fn() }));

function ScrollList() {
  const { loadMoreRef } = useBucketRecommendations({ sort: 'DISTANCE' });
  return <div ref={loadMoreRef} />;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('추천 무한스크롤', () => {
  it('하단 진입 시 추가 조회하고 로딩·실패·마지막 페이지에서는 자동 조회하지 않는다', () => {
    let callback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(handler) {
          callback = handler;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const fetchNextPage = vi.fn();
    const state = {
      data: [],
      hasNextPage: true,
      isFetching: false,
      isFetchNextPageError: false,
      fetchNextPage,
    };
    useBucketRecommendationsQuery.mockReturnValue(state);
    const view = render(<ScrollList />);
    act(() => callback([{ isIntersecting: true }]));
    expect(fetchNextPage).toHaveBeenCalledWith({ cancelRefetch: false });
    expect(observe).toHaveBeenCalledTimes(1);
    for (const change of [
      { isFetching: true },
      { isFetchNextPageError: true },
      { hasNextPage: false },
    ]) {
      useBucketRecommendationsQuery.mockReturnValue({ ...state, ...change });
      view.rerender(<ScrollList />);
      expect(observe).toHaveBeenCalledTimes(1);
    }
    expect(disconnect).toHaveBeenCalled();
  });
});
