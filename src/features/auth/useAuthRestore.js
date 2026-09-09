import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setUser } from '@/features/auth/authSlice';
import { refreshAccessToken, fetchMe } from '@/features/auth/authApi';

export function useAuthRestore() {
  const dispatch = useDispatch();
  const [isRestoring, setIsRestoring] = useState(() => {
    const isOAuthCallback = window.location.pathname === '/oauth/callback';
    return !isOAuthCallback && !!localStorage.getItem('refreshToken');
  });

  useEffect(() => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return;

    refreshAccessToken(rt)
      .then(({ accessToken, refreshToken }) => {
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        dispatch(setCredentials({ accessToken, user: null }));
        return fetchMe().catch(() => null);
      })
      .then((me) => {
        if (me) dispatch(setUser(me));
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
