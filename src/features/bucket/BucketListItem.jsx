import { MapPin } from 'lucide-react';

import { CATEGORY_STYLES } from './bucketConstants';
import { cn } from '@/shared/utils/cn';

export function BucketListItem({ bucketList }) {
  const category = CATEGORY_STYLES[bucketList.category] ?? {
    label: bucketList.category,
    color: 'text-primary',
    gradient: 'kb-grad-kdrama',
  };
  const place = bucketList.placeName || bucketList.address;

  return (
    <article className="kb-card flex items-center gap-3.5 p-3.5">
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
        <p
          className={cn(
            'text-[15px] font-extrabold leading-snug',
            bucketList.isCompleted && 'text-muted-foreground line-through',
          )}
        >
          {bucketList.title}
        </p>
        {bucketList.description && (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {bucketList.description}
          </p>
        )}
        {place && (
          <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
            <MapPin className="size-3" /> {place}
          </p>
        )}
      </div>

      <span
        className={cn('kb-check', bucketList.isCompleted ? 'kb-check--done' : 'kb-check--todo')}
        aria-label={bucketList.isCompleted ? '완료' : '미완료'}
      >
        {bucketList.isCompleted && '✓'}
      </span>
    </article>
  );
}
