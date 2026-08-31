import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { BucketFilters } from './BucketFilters';
import { BucketList } from './BucketList';
import { BucketRecommendations } from './BucketRecommendations';
import { useBucketListsQuery } from './bucketApi';
import { BUCKET_TABS, DEFAULT_FILTERS } from './bucketConstants';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';
import { cn } from '@/shared/utils/cn';

function getFilters(searchParams) {
  const page = Number(searchParams.get('page'));

  return {
    tab: searchParams.get('tab') ?? DEFAULT_FILTERS.tab,
    category: searchParams.get('category') ?? DEFAULT_FILTERS.category,
    sort: searchParams.get('sort') ?? DEFAULT_FILTERS.sort,
    page: Number.isInteger(page) && page >= 0 ? page : DEFAULT_FILTERS.page,
  };
}

export default function BucketPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = getFilters(searchParams);
  const isMyBucketList = filters.tab === 'my';
  const bucketQuery = useBucketListsQuery(filters, isMyBucketList);

  const updateFilters = (nextFilters) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value === '' || value === null) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="kb-page">
      <PageHeader
        title="Bucket list"
        action={
          <Button size="sm" disabled>
            <Plus /> Add New
          </Button>
        }
      />

      <div className="kb-segment" aria-label="버킷리스트 구분">
        {BUCKET_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={cn(
              'kb-segment__btn',
              filters.tab === tab.value && 'kb-segment__btn--active',
            )}
            onClick={() => updateFilters({ tab: tab.value, page: 0 })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isMyBucketList ? (
        <>
          <BucketFilters filters={filters} onChange={updateFilters} />
          <BucketList query={bucketQuery} filters={filters} onPageChange={updateFilters} />
        </>
      ) : (
        <BucketRecommendations filters={filters} onChange={updateFilters} />
      )}
    </div>
  );
}
