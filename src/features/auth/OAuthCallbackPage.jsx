import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, selectIsAuthenticated } from '@/features/auth/authSlice';
import { useMeQuery } from '@/features/auth/authApi';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = new URLSearchParams(window.location.search).get('error');

  useEffect(() => {
    if (error) return;

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get('accessToken');
    const refreshToken = hashParams.get('refreshToken');

    if (!accessToken || !refreshToken) return;

    localStorage.setItem('refreshToken', refreshToken);
    dispatch(setCredentials({ accessToken, user: null }));
  }, [error, dispatch]);

  const { data: me } = useMeQuery({ enabled: isAuthenticated });

  useEffect(() => {
    if (!me) return;
    navigate(me.isOnboarding ? '/home' : '/onboarding', { replace: true });
  }, [me, navigate]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted-foreground">로그인에 실패했습니다.</p>
        <a href="/login" className="text-xs text-primary underline">
          로그인으로 돌아가기
        </a>
      </div>
    );
  }

  return null;
}
