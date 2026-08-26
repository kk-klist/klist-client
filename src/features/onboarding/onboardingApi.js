import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { client } from '@/shared/api/client';

const completeOnboarding = (body) => client.patch('/api/v1/auth/onboarding', body);

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/home', { replace: true });
    },
  });
}
