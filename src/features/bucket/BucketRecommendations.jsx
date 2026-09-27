import { useState } from 'react';

import { BucketRecommendationDetailSheet } from './BucketRecommendationDetailSheet';
import { BucketRecommendationItem } from './BucketRecommendationItem';
import { useAddedBucketListsQuery } from './bucketApi';
import { useBucketCopy } from './bucketLocale';
import { RECOMMENDATION_SORTS } from './bucketConstants';
import { useBucketRecommendations } from './useBucketRecommendations';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Spinner } from '@/shared/components/Spinner';
import { cn } from '@/shared/utils/cn';

export function BucketRecommendations({ filters, onChange }) {
  const copy = useBucketCopy();
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const { loadMoreRef, ...query } = useBucketRecommendations(filters);
  const addedQuery = useAddedBucketListsQuery();

  const isAdded = (recommendation) =>
    (addedQuery.data ?? []).some((bucketList) => {
      const samePlaceName =
        bucketList.placeName?.trim().toLocaleLowerCase() ===
        recommendation.title?.trim().toLocaleLowerCase();
      const sameCoordinates =
        bucketList.latitude != null &&
        bucketList.longitude != null &&
        Math.abs(Number(bucketList.latitude) - Number(recommendation.latitude)) < 0.00001 &&
        Math.abs(Number(bucketList.longitude) - Number(recommendation.longitude)) < 0.00001;
      return samePlaceName || sameCoordinates;
    });

  if (query.isLoading) return <Spinner />;
  if (query.isError && query.recommendations.length === 0) {
    return (
      <div className="space-y-2 text-center">
        <ErrorMessage message={query.error?.message} />
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          {copy.retry}
        </Button>
      </div>
    );
  }
  if (query.recommendations.length === 0) {
    return <EmptyState message={copy.emptyRecommendation} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{copy.nearbyScope}</p>
      <div className="flex gap-2">
        {RECOMMENDATION_SORTS.map((sort) => (
          <button
            key={sort.value}
            type="button"
            className={cn('kb-chip', filters.sort === sort.value && 'kb-chip--active')}
            onClick={() => onChange({ sort: sort.value, page: 0 })}
          >
            {sort.value === 'DISTANCE' ? copy.sortDistance : copy.sortTitle}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {query.recommendations.map((recommendation) => (
          <BucketRecommendationItem
            key={recommendation.contentId}
            recommendation={recommendation}
            isAdded={isAdded(recommendation)}
            onSelect={() => setSelectedRecommendation(recommendation)}
          />
        ))}
      </div>

      <BucketRecommendationDetailSheet
        key={selectedRecommendation?.contentId ?? 'closed'}
        recommendation={selectedRecommendation}
        isAdded={selectedRecommendation ? isAdded(selectedRecommendation) : false}
        open={!!selectedRecommendation}
        onOpenChange={(open) => !open && setSelectedRecommendation(null)}
      />

      <div ref={loadMoreRef} className="min-h-8 text-center" aria-live="polite">
        {query.isFetchingNextPage && <p>{copy.loadingMore}</p>}
        {query.isError && <ErrorMessage message={query.error?.message} />}
        {query.hasNextPage && !query.isFetchingNextPage && (
          <Button
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => query.fetchNextPage({ cancelRefetch: false })}
          >
            {query.isFetchNextPageError ? copy.retry : copy.loadMore}
          </Button>
        )}
      </div>
    </div>
  );
}
