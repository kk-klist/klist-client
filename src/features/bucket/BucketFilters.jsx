import { BUCKET_CATEGORIES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { cn } from '@/shared/utils/cn';

export function BucketFilters({ filters, onChange }) {
  const copy = useBucketCopy();
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {BUCKET_CATEGORIES.map((category) => (
        <button
          key={category.value}
          type="button"
          className={cn('kb-chip', filters.category === category.value && 'kb-chip--active')}
          onClick={() => onChange({ category: category.value, page: 0 })}
        >
          {category.value === 'ALL' ? copy.all : category.label}
        </button>
      ))}
    </div>
  );
}
