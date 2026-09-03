import { useMemo } from 'react';

import { useBucketRecommendationsQuery } from './bucketApi';

const PAGE_SIZE = 10;

export function useBucketRecommendations(filters, enabled = true) {
  const query = useBucketRecommendationsQuery(enabled);
  const sortedRecommendations = useMemo(() => {
    const recommendations = [...query.data];

    if (filters.sort === 'TITLE_ASC') {
      return recommendations.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }
    return recommendations.sort(
      (a, b) =>
        (a.distanceMeters ?? Number.POSITIVE_INFINITY) -
        (b.distanceMeters ?? Number.POSITIVE_INFINITY),
    );
  }, [filters.sort, query.data]);
  const totalPages = Math.ceil(sortedRecommendations.length / PAGE_SIZE);
  const currentPage = Math.min(filters.page, Math.max(totalPages - 1, 0));
  const startIndex = currentPage * PAGE_SIZE;

  return {
    ...query,
    recommendations: sortedRecommendations.slice(startIndex, startIndex + PAGE_SIZE),
    currentPage,
    totalPages,
    hasNext: currentPage + 1 < totalPages,
  };
}
