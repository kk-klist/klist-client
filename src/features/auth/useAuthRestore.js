import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import { refreshAccessToken } from '@/features/auth/authApi';

export function useAuthRestore() {
  const dispatch = useDispatch();
  const [isRestoring, setIsRestoring] = useState(() => !!localStorage.getItem('refreshToken'));

  useEffect(() => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return;

    refreshAccessToken(rt)
      .then(({ accessToken }) => {
        dispatch(setCredentials({ accessToken, user: null }));
      })
      .catch(() => {
        localStorage.removeItem('refreshToken');
      })
      .finally(() => {
        setIsRestoring(false);
      });
  }, [dispatch]);

  return { isRestoring };
}
