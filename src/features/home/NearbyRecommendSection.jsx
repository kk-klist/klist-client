import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';
import { useNearbyRecommendQuery } from './homeApi';

const GENRE_META = {
  'K-pop': { label: 'K-POP', grad: 'kb-grad-kpop' },
  'K-drama': { label: 'K-DRAMA', grad: 'kb-grad-kdrama' },
  'K-food': { label: 'K-FOOD', grad: 'kb-grad-kfood' },
  'K-beauty': { label: 'K-BEAUTY', grad: 'kb-grad-kbeauty' },
};
const DEFAULT_GENRE_META = { label: 'K-CULTURE', grad: 'kb-grad-kpop' };

function formatDistance(meters) {
  if (meters == null) return null;
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

const SCROLL_END_BUFFER_PX = 200;

export function NearbyRecommendSection() {
  const { places, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useNearbyRecommendQuery();

  function handleScroll(e) {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = e.currentTarget;
    const distanceToEnd = el.scrollWidth - el.scrollLeft - el.clientWidth;
    if (distanceToEnd < SCROLL_END_BUFFER_PX) fetchNextPage();
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="kb-section">Do it now · near you</h2>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-extrabold text-primary">
          LIVE
        </span>
      </div>

      {isLoading && <Spinner />}
      {!isLoading && isError && <ErrorMessage message="근처 추천을 불러올 수 없어요." />}
      {!isLoading && !isError && places.length === 0 && (
        <EmptyState message="근처 추천 장소가 없어요." />
      )}
      {!isLoading && !isError && places.length > 0 && (
        <div
          className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5"
          onScroll={handleScroll}
        >
          {places.map((p) => {
            const { label, grad } = GENRE_META[p.genre] ?? DEFAULT_GENRE_META;
            const dist = formatDistance(p.dist);
            return (
              <div key={p.id} className="w-44 shrink-0">
                <div
                  className={cn(
                    'relative h-40 overflow-hidden rounded-thumb',
                    !p.thumbnail && grad,
                  )}
                >
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white">
                    {label}
                  </span>
                </div>
                <p className="mt-2 truncate text-[14px] font-bold leading-snug">{p.title}</p>
                {dist && <p className="mt-0.5 text-[12px] text-muted-foreground">📍 {dist}</p>}
              </div>
            );
          })}
          {isFetchingNextPage && (
            <div className="flex w-8 shrink-0 items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
