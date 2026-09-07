import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

import { BucketRecommendationAddSheet } from './BucketRecommendationAddSheet';
import { useBucketRecommendationDetailQuery } from './bucketApi';
import { CATEGORY_STYLES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';

function cleanHtml(value) {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatDistance(distanceMeters) {
  if (distanceMeters == null) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function BucketRecommendationDetailSheet({ recommendation, isAdded, open, onOpenChange }) {
  const [addOpen, setAddOpen] = useState(false);
  const copy = useBucketCopy();
  const detailQuery = useBucketRecommendationDetailQuery(recommendation, open);
  const detail = detailQuery.data;
  const title = detail?.title ?? recommendation?.title;
  const imageUrl = detail?.imageUrl ?? recommendation?.imageUrl;
  const address = detail?.address ?? recommendation?.address;
  const description = cleanHtml(detail?.overview);
  const distance = formatDistance(recommendation?.distanceMeters);
  const navigationUrl = recommendation
    ? `https://map.kakao.com/link/to/${encodeURIComponent(title)},${recommendation.latitude},${recommendation.longitude}`
    : null;
  const category = CATEGORY_STYLES[recommendation?.category];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[88dvh] max-w-[520px] gap-0 overflow-y-auto rounded-t-[28px] border-line bg-card p-0"
        >
          <div className="relative h-60 shrink-0 overflow-hidden rounded-t-[28px] bg-track">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {copy.imageUnavailable}
              </div>
            )}
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 text-xl font-extrabold text-white">
              {title}
            </p>
          </div>

          <SheetHeader className="space-y-3 px-5 pb-2 pt-5 text-left">
            {category && <p className={`kb-cat-label ${category.color}`}>{category.label}</p>}
            <SheetTitle className="text-[22px] font-extrabold leading-tight text-ink">
              {title}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {copy.recommendationDescription}
            </SheetDescription>
            <div className="flex flex-wrap gap-2">
              {address && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3" /> {address}
                </span>
              )}
              {distance && (
                <span className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {distance}
                </span>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-4 px-5 pb-5">
            {detailQuery.isLoading ? (
              <div className="h-16 animate-pulse rounded-xl bg-track" />
            ) : description ? (
              <p className="text-[14px] leading-relaxed text-muted-foreground">{description}</p>
            ) : (
              <p className="text-[13px] text-muted-foreground">{copy.noDescription}</p>
            )}

            <p className="text-[11px] text-muted-foreground">{copy.source}</p>
          </div>

          <SheetFooter className="sticky bottom-0 flex-row gap-3 border-t border-line bg-card px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
            {navigationUrl && (
              <Button
                variant="outline"
                className="h-12 flex-1"
                render={<a href={navigationUrl} target="_blank" rel="noreferrer" />}
              >
                <Navigation /> {copy.navigate}
              </Button>
            )}
            <Button
              className="h-12 flex-1"
              disabled={isAdded || !recommendation?.category}
              onClick={() => setAddOpen(true)}
            >
              {isAdded ? copy.alreadyAdded : copy.addToBucket}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <BucketRecommendationAddSheet
        recommendation={recommendation ?? {}}
        detail={detail}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          setAddOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
