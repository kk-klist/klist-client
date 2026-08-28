import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '@/features/auth/authSlice';
import { fetchMe } from '@/features/auth/authApi';
import { client } from '@/shared/api/client';

const completeOnboarding = (body) => client.patch('/api/v1/auth/onboarding', body);

export function useCompleteOnboardingMutation() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: async () => {
      const me = await fetchMe();
      dispatch(setUser(me));
      queryClient.setQueryData(['me'], me);
      navigate('/home', { replace: true });
    },
  });
}
