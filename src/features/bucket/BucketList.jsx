import { useState } from 'react';

import { BucketDetailSheet } from './BucketDetailSheet';
import { useBucketCopy } from './bucketLocale';
import { BucketListItem } from './BucketListItem';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Spinner } from '@/shared/components/Spinner';

export function BucketList({ query, filters, onPageChange }) {
  const copy = useBucketCopy();
  const [selectedBucketList, setSelectedBucketList] = useState(null);

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

  const page = query.data;
  const bucketLists = page?.content ?? [];

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

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page.currentPage === 0}
          onClick={() => onPageChange({ page: page.currentPage - 1 })}
        >
          {copy.previous}
        </Button>
        <span className="text-sm text-muted-foreground">
          {page.currentPage + 1} {copy.page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!page.hasNext}
          onClick={() => onPageChange({ page: page.currentPage + 1 })}
        >
          {copy.next}
        </Button>
      </div>
    </div>
  );
}
