import { MapPin } from 'lucide-react';

function formatDistance(distanceMeters) {
  if (distanceMeters == null) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function BucketRecommendationItem({ recommendation }) {
  const distance = formatDistance(recommendation.distanceMeters);

  return (
    <article className="kb-card flex items-center gap-3.5 p-3.5">
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
        <p className="text-[15px] font-extrabold leading-snug">{recommendation.title}</p>
        {recommendation.address && (
          <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
            <MapPin className="size-3" /> {recommendation.address}
          </p>
        )}
      </div>

      {distance && (
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
          {distance}
        </span>
      )}
    </article>
  );
}
