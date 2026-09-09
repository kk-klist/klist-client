import { CalendarCheck, MapPin } from 'lucide-react';

import { CATEGORY_STYLES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { useToggleBucketCompletion } from './useToggleBucketCompletion';
import { cn } from '@/shared/utils/cn';

function formatCompletedDate(completedAt, locale) {
  if (!completedAt) return null;
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function BucketListItem({ bucketList, onSelect }) {
  const { isPending, toggleCompletion } = useToggleBucketCompletion(bucketList);
  const copy = useBucketCopy();
  const category = CATEGORY_STYLES[bucketList.category] ?? {
    label: bucketList.category,
    color: 'text-primary',
    gradient: 'kb-grad-kdrama',
  };
  const place = bucketList.placeName || bucketList.address;
  const completedDate = bucketList.isCompleted
    ? formatCompletedDate(bucketList.completedAt, copy.dateLocale)
    : null;

  return (
    <article className="kb-card flex items-center gap-3.5 p-3.5">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
        aria-label={`${bucketList.title} ${copy.detailLabel}`}
        onClick={onSelect}
      >
        {bucketList.imageUrl ? (
          <img
            src={bucketList.imageUrl}
            alt=""
            className="h-[72px] w-[72px] shrink-0 rounded-thumb object-cover"
          />
        ) : (
          <div className={cn('h-[72px] w-[72px] shrink-0 rounded-thumb', category.gradient)} />
        )}

        <div className="min-w-0 flex-1">
          <p className={cn('kb-cat-label', category.color)}>{category.label}</p>
          <p className="text-[15px] font-extrabold leading-snug">{bucketList.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold',
                bucketList.isCompleted
                  ? 'bg-success/15 text-success'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {bucketList.isCompleted ? `✓ ${copy.completed}` : copy.todo}
            </span>
            {completedDate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                <CalendarCheck className="size-3" /> {completedDate}
              </span>
            )}
          </div>
          {place && (
            <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
              <MapPin className="size-3" /> {place}
            </p>
          )}
        </div>
      </button>

      <button
        type="button"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          bucketList.isCompleted
            ? 'border-success bg-success text-white'
            : 'border-line2 bg-card text-transparent hover:border-primary',
        )}
        aria-label={bucketList.isCompleted ? copy.undoCompleted : copy.markCompleted}
        aria-pressed={bucketList.isCompleted}
        disabled={isPending}
        onClick={toggleCompletion}
      >
        {bucketList.isCompleted && '✓'}
      </button>
    </article>
  );
}
