import { BucketListItem } from './BucketListItem';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Spinner } from '@/shared/components/Spinner';

export function BucketList({ query, filters, onPageChange }) {
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

  const page = query.data;
  const bucketLists = page?.content ?? [];

  if (bucketLists.length === 0) {
    const message =
      filters.category === 'ALL'
        ? '첫 번째 버킷리스트를 추가해보세요.'
        : '해당 카테고리의 버킷리스트가 없습니다.';
    return <EmptyState message={message} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {bucketLists.map((bucketList) => (
          <BucketListItem key={bucketList.bucketListId} bucketList={bucketList} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page.currentPage === 0}
          onClick={() => onPageChange({ page: page.currentPage - 1 })}
        >
          이전
        </Button>
        <span className="text-sm text-muted-foreground">{page.currentPage + 1} 페이지</span>
        <Button
          variant="outline"
          size="sm"
          disabled={!page.hasNext}
          onClick={() => onPageChange({ page: page.currentPage + 1 })}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
