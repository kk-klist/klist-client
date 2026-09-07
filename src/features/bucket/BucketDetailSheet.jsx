import { CalendarCheck, Map as MapIcon, MapPin, Navigation } from 'lucide-react';

import { useBucketListQuery } from './bucketApi';
import { CATEGORY_STYLES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { useToggleBucketCompletion } from './useToggleBucketCompletion';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { cn } from '@/shared/utils/cn';

function cleanHtml(value) {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function createNavigationUrl(bucketList) {
  if (!bucketList?.latitude || !bucketList?.longitude) return null;
  const placeName = bucketList.placeName || bucketList.title;
  return `https://map.kakao.com/link/to/${encodeURIComponent(placeName)},${bucketList.latitude},${bucketList.longitude}`;
}

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

export function BucketDetailSheet({ bucketList, open, onOpenChange }) {
  const copy = useBucketCopy();
  const detailQuery = useBucketListQuery(bucketList?.bucketListId, open);
  const detail = detailQuery.data ?? bucketList;
  const { isPending, toggleCompletion } = useToggleBucketCompletion(detail ?? {});
  const category = CATEGORY_STYLES[detail?.category] ?? {
    label: detail?.category,
    color: 'text-primary',
  };
  const navigationUrl = createNavigationUrl(detail);
  const description = cleanHtml(detail?.description);
  const completedDate = detail?.isCompleted
    ? formatCompletedDate(detail.completedAt, copy.dateLocale)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] max-w-[520px] gap-0 overflow-y-auto rounded-t-[28px] border-line bg-card p-0"
      >
        <div className="relative h-60 shrink-0 overflow-hidden rounded-t-[28px] bg-track">
          {detail?.imageUrl ? (
            <img src={detail.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapIcon className="size-12" />
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-md bg-ink/60 px-2.5 py-1 text-[11px] font-bold text-white">
            {category.label}
          </span>
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 text-xl font-extrabold text-white">
            {detail?.placeName || detail?.title}
          </p>
        </div>

        <SheetHeader className="space-y-3 px-5 pb-2 pt-5 text-left">
          <SheetTitle className="text-[22px] font-extrabold leading-tight text-ink">
            {detail?.title}
          </SheetTitle>
          <SheetDescription className="sr-only">{copy.detailDescription}</SheetDescription>
          <div className="flex flex-wrap gap-2">
            {detail?.address && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <MapPin className="size-3" /> {detail.address}
              </span>
            )}
            {detail?.distance && (
              <span className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                {detail.distance}
              </span>
            )}
            <span
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-bold',
                detail?.isCompleted
                  ? 'bg-success/15 text-success'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {detail?.isCompleted ? `✓ ${copy.completed}` : copy.todo}
            </span>
            {completedDate && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
                <CalendarCheck className="size-3" /> {copy.completedDate}: {completedDate}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-5 px-5 pb-5">
          {detailQuery.isLoading ? (
            <div className="h-16 animate-pulse rounded-xl bg-track" />
          ) : (
            description && (
              <p className="text-[14px] leading-relaxed text-muted-foreground">{description}</p>
            )
          )}
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
            className={cn('h-12 flex-1', detail?.isCompleted && 'bg-success hover:bg-success/90')}
            disabled={isPending || !detail?.bucketListId}
            onClick={toggleCompletion}
          >
            {detail?.isCompleted ? `✓ ${copy.completed}` : copy.markCompleted}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
