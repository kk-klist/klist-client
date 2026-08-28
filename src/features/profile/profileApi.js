import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/authSlice';
import { client } from '@/shared/api/client';

const withdrawMember = (body) => client.delete('/api/v1/members/me', { data: body });

const updateProfile = (body) => client.patch('/api/v1/members/me', body);

const updateProfileImage = (body) =>
  client.put('/api/v1/members/me/profile-image', body).then((res) => res?.data);

const updatePreferredLanguage = (body) => client.patch('/api/v1/members/me/language', body);

export function useWithdrawMutation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: withdrawMember,
    onSuccess: () => {
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      dispatch(logout());
      navigate('/home', { replace: true });
    },
  });
}

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

export function useUpdatePreferredLanguageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferredLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
  });
}
