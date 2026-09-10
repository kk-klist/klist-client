import { useEffect, useRef, useState } from 'react';

import { BucketDetailSheet } from './BucketDetailSheet';
import { useBucketCopy } from './bucketLocale';
import { BucketListItem } from './BucketListItem';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Spinner } from '@/shared/components/Spinner';

export function BucketList({ query, filters }) {
  const copy = useBucketCopy();
  const [selectedBucketList, setSelectedBucketList] = useState(null);
  const loadMoreRef = useRef(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

  const bucketLists = query.data?.pages.flatMap((page) => page.content ?? []) ?? [];

  if (bucketLists.length === 0) {
    const message = filters.category === 'ALL' ? copy.emptyList : copy.emptyCategory;
    return <EmptyState message={message} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {bucketLists.map((bucketList) => (
          <BucketListItem
            key={bucketList.bucketListId}
            bucketList={bucketList}
            onSelect={() => setSelectedBucketList(bucketList)}
          />
        ))}
      </div>

      <BucketDetailSheet
        bucketList={selectedBucketList}
        open={!!selectedBucketList}
        onOpenChange={(open) => !open && setSelectedBucketList(null)}
      />

      <div ref={loadMoreRef} className="min-h-3" aria-hidden>
        {query.isFetchingNextPage && (
          <div className="space-y-3 pt-1">
            {[0, 1].map((index) => (
              <div key={index} className="kb-card flex animate-pulse items-center gap-3.5 p-3.5">
                <div className="h-[72px] w-[72px] shrink-0 rounded-thumb bg-track" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 rounded bg-track" />
                  <div className="h-4 w-2/3 rounded bg-track" />
                  <div className="h-3 w-1/2 rounded bg-track" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
