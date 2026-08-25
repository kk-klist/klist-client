import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '@/features/onboarding/onboardingSchemas';
import { useCompleteOnboardingMutation } from '@/features/onboarding/onboardingApi';

export function useCompleteOnboarding() {
  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nickname: '',
      profileImage: null,
      nationality: '',
      preferredLanguage: '',
    },
  });

  const { mutate, isPending } = useCompleteOnboardingMutation();

  function onSubmit(data) {
    mutate(data, {
      onError: (err) => {
        if (err?.code === 'INVALID_INPUT') {
          err.errors?.forEach((e) => form.setError(e.field, { message: e.reason }));
        }
      },
    });
  }

  return { form, isPending, onSubmit: form.handleSubmit(onSubmit) };
}
