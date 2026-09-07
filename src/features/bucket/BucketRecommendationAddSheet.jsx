import { CATEGORY_STYLES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { useAddBucketRecommendation } from './useAddBucketRecommendation';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';

export function BucketRecommendationAddSheet({
  recommendation,
  detail,
  open,
  onOpenChange,
  onAdded,
}) {
  const copy = useBucketCopy();
  const { form, handleSubmit, isPending } = useAddBucketRecommendation(
    recommendation,
    detail,
    onAdded,
    open,
  );
  const category = CATEGORY_STYLES[recommendation?.category];
  const placeName = detail?.title ?? recommendation?.title;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] max-w-[520px] overflow-y-auto rounded-t-[28px] border-line bg-card p-0"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="space-y-2 px-5 pb-4 pt-6 text-left">
            <SheetTitle className="text-[22px] font-extrabold text-ink">
              {copy.createTitle}
            </SheetTitle>
            <SheetDescription>{copy.createDescription}</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-5 pb-6">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">{copy.titleLabel}</span>
              <input
                {...form.register('title')}
                className="h-12 w-full rounded-xl border border-line2 bg-card px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder={copy.titlePlaceholder}
                disabled={isPending}
              />
              {form.formState.errors.title && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </span>
              )}
            </label>

            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">{copy.placeLabel}</span>
              <div className="rounded-xl bg-track px-4 py-3 text-sm text-muted-foreground">
                {placeName}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">{copy.categoryLabel}</span>
              <div className="rounded-xl bg-track px-4 py-3 text-sm font-semibold text-ink">
                {category?.label ?? recommendation?.category}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">{copy.descriptionLabel}</span>
              <textarea
                {...form.register('description')}
                rows={4}
                className="w-full resize-none rounded-xl border border-line2 bg-card px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                disabled={isPending}
              />
              {form.formState.errors.description && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </span>
              )}
            </label>
          </div>

          <SheetFooter className="sticky bottom-0 flex-row gap-3 border-t border-line bg-card px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {copy.cancel}
            </Button>
            <Button type="submit" className="h-12 flex-1" disabled={isPending}>
              {isPending ? copy.adding : copy.save}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
