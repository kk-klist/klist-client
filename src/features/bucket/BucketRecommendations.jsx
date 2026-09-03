import { BucketRecommendationItem } from './BucketRecommendationItem';
import { RECOMMENDATION_SORTS } from './bucketConstants';
import { useBucketRecommendations } from './useBucketRecommendations';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Spinner } from '@/shared/components/Spinner';
import { cn } from '@/shared/utils/cn';

export function BucketRecommendations({ filters, onChange }) {
  const query = useBucketRecommendations(filters);

  if (query.isLoading) return <Spinner />;
  if (query.isError) {
    return (
      <div className="space-y-2 text-center">
        <ErrorMessage message={query.error?.message} />
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }
  if (query.recommendations.length === 0) {
    return <EmptyState message="주변에 추천할 관광지가 없습니다." />;
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
            {sort.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {query.recommendations.map((recommendation) => (
          <BucketRecommendationItem
            key={recommendation.contentId}
            recommendation={recommendation}
          />
        ))}
      </div>

      {query.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={query.currentPage === 0}
            onClick={() => onChange({ page: query.currentPage - 1 })}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground">{query.currentPage + 1} 페이지</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!query.hasNext}
            onClick={() => onChange({ page: query.currentPage + 1 })}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
