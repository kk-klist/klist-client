import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useFormContext } from 'react-hook-form';
import { useMeQuery } from '@/features/auth/authApi';
import { useCompleteOnboarding } from '@/features/onboarding/useCompleteOnboarding';
import { ProfileImageField } from '@/features/onboarding/ProfileImageField';
import { SearchableSelect } from '@/features/onboarding/SearchableSelect';
import {
  SUPPORTED_NATIONALITIES,
  SUPPORTED_LANGUAGES,
} from '@/features/onboarding/onboardingSchemas';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/Spinner';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { data: me, isLoading } = useMeQuery();
  const { form, isPending, onSubmit } = useCompleteOnboarding();

  useEffect(() => {
    if (me?.isOnboarding) navigate('/home', { replace: true });
  }, [me, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-foreground">프로필 설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          한국 여행을 시작하기 전에 나를 소개해요
        </p>
      </header>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col px-6 pb-10">
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex justify-center">
              <ProfileImageField />
            </div>

            <NicknameField />
            <NationalityField />
            <LanguageField />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-8 h-14 w-full rounded-xl text-base font-semibold"
          >
            {isPending ? <Spinner className="size-5" /> : '시작하기'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}

function NicknameField() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        닉네임 <span className="text-destructive">*</span>
      </label>
      <input
        {...register('nickname')}
        type="text"
        placeholder="2~20자로 입력해주세요"
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary aria-invalid:border-destructive"
        aria-invalid={!!errors.nickname}
      />
      {errors.nickname && <p className="text-xs text-destructive">{errors.nickname.message}</p>}
    </div>
  );
}

function NationalityField() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        국적 <span className="text-destructive">*</span>
      </label>
      <SearchableSelect
        options={SUPPORTED_NATIONALITIES}
        value={watch('nationality')}
        onChange={(v) => setValue('nationality', v, { shouldValidate: true })}
        placeholder="국적을 선택해주세요"
        error={errors.nationality?.message}
      />
    </div>
  );
}

function LanguageField() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        선호 언어 <span className="text-destructive">*</span>
      </label>
      <SearchableSelect
        options={SUPPORTED_LANGUAGES}
        value={watch('preferredLanguage')}
        onChange={(v) => setValue('preferredLanguage', v, { shouldValidate: true })}
        placeholder="언어를 선택해주세요"
        error={errors.preferredLanguage?.message}
      />
    </div>
  );
}
