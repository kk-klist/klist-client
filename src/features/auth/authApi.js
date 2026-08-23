import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { client } from '@/shared/api/client';
import { logout } from '@/features/auth/authSlice';

const unwrap = (res) => res?.data;

export const refreshAccessToken = (refreshToken) =>
  client.post('/api/v1/auth/refresh', { refreshToken }).then(unwrap);

export const fetchMe = () => client.get('/api/v1/members/me').then(unwrap);

export const useMeQuery = (options) => useQuery({ queryKey: ['me'], queryFn: fetchMe, ...options });

const logoutApi = () => client.post('/api/v1/auth/logout').then(unwrap);

export const useLogoutMutation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      dispatch(logout());
      navigate('/login', { replace: true });
    },
  });
};
