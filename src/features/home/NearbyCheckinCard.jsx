import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useNearbyCheckinQuery } from './homeApi';
import { LoginPromptCard } from './LoginPromptCard';

export function NearbyCheckinCard() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const { candidate, isLoading, isError } = useNearbyCheckinQuery({ enabled: isAuthenticated });

  if (!isAuthenticated) {
    return <LoginPromptCard message="로그인하고 근처 체크인 확인하기" />;
  }

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="근처 체크인 정보를 불러올 수 없어요." />;
  if (!candidate) return <EmptyState message="근처에 체크인할 버킷리스트가 없어요." />;

  const place = candidate.placeName || candidate.title;

  return (
    <button
      type="button"
      onClick={() => navigate('/map')}
      className="flex w-full items-center gap-4 rounded-card border border-primary/20 bg-primary-soft p-4 text-left"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-primary">
        📍
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-extrabold">You’re nearby · {place}</p>
        <p className="text-[13px] text-muted-foreground">Tap to check in & complete</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        ›
      </span>
    </button>
  );
}
