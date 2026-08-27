import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/shared/api/client';

const updateProfile = (body) => client.patch('/api/v1/members/me', body);

const updateProfileImage = (body) =>
  client.put('/api/v1/members/me/profile-image', body).then((res) => res?.data);

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
  });
}

export function useUpdateProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
  });
}
