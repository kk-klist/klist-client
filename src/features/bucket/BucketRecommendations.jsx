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
  const query = useBucketRecommendations(filters);
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
  if (query.isError) {
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

      {query.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={query.currentPage === 0}
            onClick={() => onChange({ page: query.currentPage - 1 })}
          >
            {copy.previous}
          </Button>
          <span className="text-sm text-muted-foreground">
            {query.currentPage + 1} {copy.page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!query.hasNext}
            onClick={() => onChange({ page: query.currentPage + 1 })}
          >
            {copy.next}
          </Button>
        </div>
      )}
    </div>
  );
}
