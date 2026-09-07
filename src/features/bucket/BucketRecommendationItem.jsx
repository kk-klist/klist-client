import { MapPin } from 'lucide-react';

import { CATEGORY_STYLES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { cn } from '@/shared/utils/cn';

function formatDistance(distanceMeters) {
  if (distanceMeters == null) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function BucketRecommendationItem({ recommendation, isAdded = false, onSelect }) {
  const copy = useBucketCopy();
  const distance = formatDistance(recommendation.distanceMeters);
  const category = CATEGORY_STYLES[recommendation.category];

  return (
    <button
      type="button"
      className="kb-card flex w-full items-center gap-3.5 p-3.5 text-left"
      aria-label={`${recommendation.title} ${copy.detailLabel}`}
      onClick={onSelect}
    >
      {recommendation.imageUrl ? (
        <img
          src={recommendation.imageUrl}
          alt=""
          className="h-[72px] w-[72px] shrink-0 rounded-thumb object-cover"
        />
      ) : (
        <div className="h-[72px] w-[72px] shrink-0 rounded-thumb bg-track" />
      )}

      <div className="min-w-0 flex-1">
        {category && <p className={cn('kb-cat-label', category.color)}>{category.label}</p>}
        <p className="text-[15px] font-extrabold leading-snug">{recommendation.title}</p>
        {recommendation.address && (
          <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
            <MapPin className="size-3" /> {recommendation.address}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {isAdded && (
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
            ✓ {copy.alreadyAdded}
          </span>
        )}
        {distance && (
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
            {distance}
          </span>
        )}
      </div>
    </button>
  );
}
