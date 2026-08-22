import { useQuery } from '@tanstack/react-query';

import { client } from '@/shared/api/client';

const PAGE_SIZE = 10;
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
