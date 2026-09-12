import { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { useBucketPlaceSearchQuery } from './bucketApi';
import { BUCKET_CATEGORIES } from './bucketConstants';
import { useBucketCopy } from './bucketLocale';
import { useCreateBucketList } from './useCreateBucketList';
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

const CATEGORIES = BUCKET_CATEGORIES.filter(({ value }) => value !== 'ALL');

export function BucketCreateSheet({ open, onOpenChange }) {
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const copy = useBucketCopy();
  const { form, handleSubmit, isPending } = useCreateBucketList(open, () => onOpenChange(false));
  const selectedCategory = useWatch({ control: form.control, name: 'category' });
  const selectedPlace = useWatch({ control: form.control, name: 'placeName' });
  const placeQuery = useBucketPlaceSearchQuery(keyword, open);

  const selectPlace = (place) => {
    form.setValue('placeName', place.title ?? '');
    form.setValue('address', place.address ?? '');
    form.setValue('latitude', place.latitude ?? null);
    form.setValue('longitude', place.longitude ?? null);
    form.setValue('imageUrl', place.imageUrl ?? null);
    setKeyword('');
    setSearchText('');
  };

  const removePlace = () => {
    form.setValue('placeName', '');
    form.setValue('address', '');
    form.setValue('latitude', null);
    form.setValue('longitude', null);
    form.setValue('imageUrl', null);
  };

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
            <SheetDescription>{copy.directCreateDescription}</SheetDescription>
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
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-ink">{copy.categoryLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
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
            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">{copy.placeOptional}</span>
              {selectedPlace ? (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-track px-3 py-3">
                  <MapPin className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{selectedPlace}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {form.getValues('address')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={copy.removePlace}
                    onClick={removePlace}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          if (searchText.trim()) setKeyword(searchText.trim());
                        }
                      }}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-line2 bg-card px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      placeholder={copy.placeSearchPlaceholder}
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={copy.placeSearch}
                      disabled={!searchText.trim() || isPending}
                      onClick={() => setKeyword(searchText.trim())}
                    >
                      <Search />
                    </Button>
                  </div>
                  {placeQuery.isLoading && (
                    <div className="h-12 animate-pulse rounded-xl bg-track" />
                  )}
                  {placeQuery.isError && (
                    <p className="text-xs text-destructive">{copy.placeSearchError}</p>
                  )}
                  {keyword && !placeQuery.isLoading && placeQuery.data?.length === 0 && (
                    <p className="text-xs text-muted-foreground">{copy.placeSearchEmpty}</p>
                  )}
                  {keyword && placeQuery.data?.length > 0 && (
                    <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-line p-1">
                      {placeQuery.data.map((place) => (
                        <button
                          key={`${place.contentId}-${place.title}`}
                          type="button"
                          className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-track"
                          onClick={() => selectPlace(place)}
                        >
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-ink">
                              {place.title}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {place.address}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">{copy.descriptionLabel}</span>
              <textarea
                {...form.register('description')}
                rows={5}
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
