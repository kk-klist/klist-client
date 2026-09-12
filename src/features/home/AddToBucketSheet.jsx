import { useWatch } from 'react-hook-form';

import { PLACE_CATEGORIES } from './homeApi';
import { useAddPlaceToBucket } from './useAddPlaceToBucket';
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

export function AddToBucketSheet({ place, open, onOpenChange, onAdded }) {
  const { form, handleSubmit, isPending } = useAddPlaceToBucket(place, onAdded, open);
  const selectedCategory = useWatch({ control: form.control, name: 'category' });
  const description = useWatch({ control: form.control, name: 'description' });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] max-w-[520px] overflow-y-auto rounded-t-[28px] border-line bg-card p-0"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="space-y-2 px-5 pb-4 pt-6 text-left">
            <SheetTitle className="text-[22px] font-extrabold text-ink">
              버킷리스트에 담기
            </SheetTitle>
            <SheetDescription>어떤 목표로 담을지 적어주세요.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-5 pb-6">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">제목</span>
              <input
                {...form.register('title')}
                className="h-12 w-full rounded-xl border border-line2 bg-card px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="예: 한복 입고 궁궐 산책하기"
                disabled={isPending}
              />
              {form.formState.errors.title && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </span>
              )}
            </label>

            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">장소</span>
              <div className="rounded-xl bg-track px-4 py-3 text-sm text-muted-foreground">
                {place?.title}
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-ink">카테고리</legend>
              <div className="flex flex-wrap gap-2">
                {PLACE_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    className={cn(
                      'kb-chip',
                      selectedCategory === category.value && 'kb-chip--active',
                    )}
                    aria-pressed={selectedCategory === category.value}
                    disabled={isPending}
                    onClick={() =>
                      form.setValue('category', category.value, { shouldValidate: true })
                    }
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              {form.formState.errors.category && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.category.message}
                </span>
              )}
            </fieldset>

            <label className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">설명</span>
                <span className="text-xs text-muted-foreground">
                  {(description ?? '').length} / 300
                </span>
              </div>
              <textarea
                {...form.register('description')}
                rows={4}
                maxLength={300}
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
              취소
            </Button>
            <Button type="submit" className="h-12 flex-1" disabled={isPending}>
              {isPending ? '담는 중...' : '담기'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
