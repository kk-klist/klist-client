import { useEffect, useMemo, useRef } from 'react';

import { useBucketRecommendationsQuery } from './bucketApi';

export function useBucketRecommendations(filters, enabled = true) {
  const query = useBucketRecommendationsQuery(enabled);
  const loadMoreRef = useRef(null);
  const { fetchNextPage, hasNextPage, isFetching, isFetchNextPageError } = query;
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetching || isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage({ cancelRefetch: false });
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]);
  const sortedRecommendations = useMemo(() => {
    const recommendations = [
      ...new Map(query.data.map((place) => [place.contentId, place])).values(),
    ];

    if (filters.sort === 'TITLE_ASC') {
      return recommendations.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }
    return recommendations.sort(
      (a, b) =>
        (a.distanceMeters ?? Number.POSITIVE_INFINITY) -
        (b.distanceMeters ?? Number.POSITIVE_INFINITY),
    );
  }, [filters.sort, query.data]);

  return {
    ...query,
    recommendations: sortedRecommendations,
    loadMoreRef,
  };
}
