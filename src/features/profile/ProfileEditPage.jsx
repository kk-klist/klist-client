import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { SUPPORTED_NATIONALITIES } from '@/shared/constants/locationOptions';
import { ProfileImageField } from '@/shared/components/ProfileImageField';
import { SearchableSelect } from '@/shared/components/SearchableSelect';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/Spinner';
import { useUpdateProfile } from './useUpdateProfile';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { form, isPending, onSubmit } = useUpdateProfile();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 px-5 pt-14 pb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-track text-foreground"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-foreground">프로필 수정</h1>
      </header>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col px-6 pb-10">
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex justify-center">
              <ProfileImageField />
            </div>

            <NicknameField />
            <NationalityField />
          </div>

          <Button
            type="submit"
            disabled={!form.formState.isDirty || isPending}
            className="mt-8 h-14 w-full rounded-xl text-base font-semibold"
          >
            {isPending ? <Spinner className="size-5" /> : '저장'}
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
      <label className="text-sm font-medium text-foreground">닉네임</label>
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
      <label className="text-sm font-medium text-foreground">국적</label>
      <SearchableSelect
        options={SUPPORTED_NATIONALITIES}
        value={watch('nationality')}
        onChange={(v) => setValue('nationality', v, { shouldDirty: true, shouldValidate: true })}
        placeholder="국적을 선택해주세요"
        error={errors.nationality?.message}
      />
    </div>
  );
}
