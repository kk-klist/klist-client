import { BUCKET_CATEGORIES, BUCKET_COMPLETION_FILTERS } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { cn } from '@/shared/utils/cn';

export function BucketFilters({ filters, onChange }) {
  const copy = useBucketCopy();
  return (
    <div className="-mx-5 flex items-center gap-2 px-5">
      <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
        {BUCKET_CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            className={cn(
              'kb-chip shrink-0',
              filters.category === category.value && 'kb-chip--active',
            )}
            onClick={() => onChange({ category: category.value })}
          >
            {category.value === 'ALL' ? copy.all : category.label}
          </button>
        ))}
      </div>
      <div className="shrink-0 border-l border-line pl-2">
        <label className="relative inline-flex items-center">
          <ListFilter className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <select
            value={filters.completed}
            aria-label={copy.completionFilterLabel}
            className="h-9 appearance-none rounded-full border border-line2 bg-card pl-9 pr-8 text-xs font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            onChange={(event) => onChange({ completed: event.target.value })}
          >
            {BUCKET_COMPLETION_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {copy[filter.copyKey]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
        </label>
      </div>
    </div>
  );
}
import { ChevronDown, ListFilter } from 'lucide-react';
