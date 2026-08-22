import { BUCKET_CATEGORIES } from './bucketConstants';
import { cn } from '@/shared/utils/cn';

export function BucketFilters({ filters, onChange }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {BUCKET_CATEGORIES.map((category) => (
        <button
          key={category.value}
          type="button"
          className={cn('kb-chip', filters.category === category.value && 'kb-chip--active')}
          onClick={() => onChange({ category: category.value, page: 0 })}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
