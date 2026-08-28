import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, setUser } from '@/features/auth/authSlice';
import { SUPPORTED_LANGUAGES } from '@/shared/constants/locationOptions';
import { cn } from '@/shared/utils/cn';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useUpdatePreferredLanguageMutation } from '@/features/profile/profileApi';

export function LanguageBottomSheet({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { mutate: updatePreferredLanguage, isPending } = useUpdatePreferredLanguageMutation();

  function handleSelect(lang) {
    if (isPending) return;
    updatePreferredLanguage(
      { preferredLanguage: lang },
      {
        onSuccess: () => {
          dispatch(setUser({ ...user, preferredLanguage: lang }));
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-[560px] rounded-t-2xl px-0 pb-8"
      >
        <SheetHeader className="px-5 pb-2">
          <SheetTitle>표시 언어 선택</SheetTitle>
        </SheetHeader>
        <ul>
          {SUPPORTED_LANGUAGES.map(({ value, label }) => (
            <li key={value}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSelect(value)}
                className={cn(
                  'flex w-full items-center px-5 py-3.5 text-[15px] font-semibold transition-colors',
                  value === user?.preferredLanguage ? 'text-primary' : 'text-foreground',
                )}
              >
                {label}
                {value === user?.preferredLanguage && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
