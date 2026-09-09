import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { SUPPORTED_NATIONALITIES } from '@/shared/constants/locationOptions';
import { ProfileImageField } from '@/shared/components/ProfileImageField';
import { SearchableSelect } from '@/shared/components/SearchableSelect';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/Spinner';
import { useUpdateProfile } from './useUpdateProfile';
import { getProfileCopy, useProfileCopy } from './profileLocale';
import { ProfileLocaleProvider } from './ProfileLocaleProvider';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { form, isPending, onSubmit } = useUpdateProfile();
  const copy = getProfileCopy(user?.preferredLanguage);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <ProfileLocaleProvider language={user?.preferredLanguage}>
      <div className="flex min-h-full flex-col">
        <header className="flex items-center gap-3 px-5 pt-14 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-track text-foreground"
            aria-label={copy.back}
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-foreground">{copy.pageTitle}</h1>
        </header>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col px-6 pb-10">
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex justify-center">
                <ProfileImageField
                  changeLabel={copy.profileImageChange}
                  addLabel={copy.profileImageAdd}
                />
              </div>

              <NicknameField />
              <NationalityField />
            </div>

            <Button
              type="submit"
              disabled={!form.formState.isDirty || isPending}
              className="mt-8 h-14 w-full rounded-xl text-base font-semibold"
            >
              {isPending ? <Spinner className="size-5" /> : copy.save}
            </Button>
          </form>
        </FormProvider>
      </div>
    </ProfileLocaleProvider>
  );
}

function NicknameField() {
  const copy = useProfileCopy();
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{copy.nicknameLabel}</label>
      <input
        {...register('nickname')}
        type="text"
        placeholder={copy.nicknamePlaceholder}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary aria-invalid:border-destructive"
        aria-invalid={!!errors.nickname}
      />
      {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
    </div>
  );
}

function NationalityField() {
  const copy = useProfileCopy();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{copy.nationalityLabel}</label>
      <SearchableSelect
        options={SUPPORTED_NATIONALITIES}
        value={watch('nationality')}
        onChange={(v) => setValue('nationality', v, { shouldDirty: true, shouldValidate: true })}
        placeholder={copy.nationalityPlaceholder}
        error={errors.nationality?.message}
      />
    </div>
  );
}
