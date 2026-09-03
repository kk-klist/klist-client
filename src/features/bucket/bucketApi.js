import { useQuery } from '@tanstack/react-query';

import { client } from '@/shared/api/client';
import { getCurrentPosition } from '@/shared/utils/geo';

const PAGE_SIZE = 10;
const RECOMMENDATION_STALE_TIME = 30 * 60 * 1000;
const unwrap = (response) => response?.data ?? response;

const fetchBucketLists = ({ category, page }) =>
  client
    .get('/api/v1/bucket-lists', {
      params: {
        category,
        page,
        size: PAGE_SIZE,
      },
    })
    .then(unwrap);

export function useBucketListsQuery(filters, enabled = true) {
  const conditions = {
    category: filters.category,
    page: filters.page,
  };

  return useQuery({
    queryKey: ['bucket', 'list', conditions],
    queryFn: () => fetchBucketLists(conditions),
    enabled,
  });
}

const fetchBucketRecommendations = ({ latitude, longitude }) =>
  client
    .get('/api/v1/bucket-lists/recommendations', {
      params: { latitude, longitude },
    })
    .then(unwrap);

function roundCoordinate(coordinate) {
  return Number(coordinate.toFixed(3));
}

export function useBucketRecommendationsQuery(enabled = true) {
  const geoQuery = useQuery({
    queryKey: ['geo', 'current'],
    queryFn: getCurrentPosition,
    enabled,
    staleTime: RECOMMENDATION_STALE_TIME,
    retry: false,
  });
  const coordinates = geoQuery.data;
  const conditions = coordinates
    ? {
        type: 'recommendations',
        latitude: roundCoordinate(coordinates.lat),
        longitude: roundCoordinate(coordinates.lng),
      }
    : null;
  const recommendationQuery = useQuery({
    queryKey: ['bucket', 'list', conditions],
    queryFn: () =>
      fetchBucketRecommendations({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      }),
    enabled: enabled && !!coordinates,
    staleTime: RECOMMENDATION_STALE_TIME,
    retry: 1,
  });

  return {
    data: recommendationQuery.data ?? [],
    isLoading: enabled && (geoQuery.isPending || (!!coordinates && recommendationQuery.isPending)),
    isError: geoQuery.isError || recommendationQuery.isError,
    error: geoQuery.error ?? recommendationQuery.error,
    refetch: geoQuery.isError ? geoQuery.refetch : recommendationQuery.refetch,
  };
}
