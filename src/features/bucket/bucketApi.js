import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client } from '@/shared/api/client';
import { getCurrentPosition } from '@/shared/utils/geo';

const PAGE_SIZE = 10;
const RECOMMENDATION_STALE_TIME = 30 * 60 * 1000;
const unwrap = (response) => response?.data ?? response;

const fetchBucketLists = ({ category, completed, page }) =>
  client
    .get('/api/v1/bucket-lists', {
      params: {
        category,
        ...(completed !== 'ALL' && { completed: completed === 'COMPLETED' }),
        page,
        size: PAGE_SIZE,
      },
    })
    .then(unwrap);

export function useBucketListsQuery(filters, enabled = true) {
  const conditions = {
    category: filters.category,
    completed: filters.completed,
  };

  return useInfiniteQuery({
    queryKey: ['bucket', 'list', conditions],
    queryFn: ({ pageParam }) => fetchBucketLists({ ...conditions, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.currentPage + 1 : undefined),
    enabled,
  });
}

const fetchAddedBucketLists = () =>
  client
    .get('/api/v1/bucket-lists', {
      params: { category: 'ALL', page: 0, size: 1000 },
    })
    .then(unwrap)
    .then((page) => page?.content ?? []);

export function useAddedBucketListsQuery(enabled = true) {
  return useQuery({
    queryKey: ['bucket', 'addedLookup'],
    queryFn: fetchAddedBucketLists,
    enabled,
  });
}

const fetchBucketList = (bucketListId) =>
  client.get(`/api/v1/bucket-lists/${bucketListId}`).then(unwrap);

export function useBucketListQuery(bucketListId, enabled = true) {
  return useQuery({
    queryKey: ['bucket', 'detail', bucketListId],
    queryFn: () => fetchBucketList(bucketListId),
    enabled: enabled && !!bucketListId,
  });
}
const updateBucketCompletion = ({ bucketListId, isCompleted }) =>
  client.patch(`/api/v1/bucket-lists/${bucketListId}/completion`, { isCompleted });

export function useUpdateBucketCompletionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBucketCompletion,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bucket'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'bucketProgress'] }),
      ]);
    },
  });
}

const GENRE_TO_CATEGORY = {
  'K-pop': 'K_POP',
  'K-drama': 'K_DRAMA',
  'K-food': 'K_FOOD',
  'K-beauty': 'K_BEAUTY',
};

const fetchBucketRecommendations = ({ latitude, longitude }) =>
  client
    .get('/api/v1/recommend', {
      params: { lat: latitude, lng: longitude },
    })
    .then(unwrap)
    .then((recommendations) =>
      (recommendations ?? []).map((recommendation) => ({
        ...recommendation,
        category: GENRE_TO_CATEGORY[recommendation.genre],
      })),
    );

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
        latitude: conditions.latitude,
        longitude: conditions.longitude,
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

const fetchTourDetail = ({ contentId, contentTypeId }) =>
  client
    .get(`/api/v1/tour/detail/${encodeURIComponent(contentId)}`, {
      params: { contentTypeId, lang: 'ko' },
    })
    .then(unwrap);

export function useBucketRecommendationDetailQuery(recommendation, enabled = true) {
  return useQuery({
    queryKey: ['tour', 'detail', recommendation?.contentId, recommendation?.contentTypeId],
    queryFn: () => fetchTourDetail(recommendation),
    enabled: enabled && !!recommendation?.contentId,
  });
}

const fetchBucketPlaceSearch = (keyword) =>
  client
    .get('/api/v1/tour/search', { params: { keyword, lang: 'ko' } })
    .then(unwrap)
    .then((places) => places ?? []);

export function useBucketPlaceSearchQuery(keyword, enabled = true) {
  return useQuery({
    queryKey: ['bucket', 'placeSearch', keyword],
    queryFn: () => fetchBucketPlaceSearch(keyword),
    enabled: enabled && !!keyword,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

const createBucketList = (request) => client.post('/api/v1/bucket-lists', request).then(unwrap);

export function useCreateBucketListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBucketList,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bucket'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'bucketProgress'] }),
      ]);
    },
  });
}

const updateBucketList = ({ bucketListId, request }) =>
  client.patch(`/api/v1/bucket-lists/${bucketListId}`, request).then(unwrap);

export function useUpdateBucketListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBucketList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bucket'] }),
  });
}

const deleteBucketList = (bucketListId) => client.delete(`/api/v1/bucket-lists/${bucketListId}`);

export function useDeleteBucketListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBucketList,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bucket'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'bucketProgress'] }),
      ]);
    },
  });
}
