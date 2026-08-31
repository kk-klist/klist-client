import { useSelector } from 'react-redux';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useBucketProgressQuery } from './homeApi';
import { ProgressDonut } from './ProgressDonut';
import { LoginPromptCard } from './LoginPromptCard';

export function BucketProgressCard() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, isError } = useBucketProgressQuery({ enabled: isAuthenticated });

  if (!isAuthenticated) {
    return <LoginPromptCard message="로그인하고 진행률 확인하기" />;
  }

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="진행률을 불러올 수 없어요." />;
  if (!data || data.totalCount === 0) {
    return <EmptyState message="아직 등록한 버킷리스트가 없어요." />;
  }

  return (
    <section className="kb-card flex items-center gap-5 p-5">
      <ProgressDonut percent={Math.round(data.progressRate)} />
      <div className="flex-1">
        <p className="text-[13px] text-muted-foreground">Bucket list progress</p>
        <p className="text-[22px] font-extrabold">
          {data.completedCount}{' '}
          <span className="text-muted-foreground">/ {data.totalCount} done</span>
        </p>
        <div className="mt-2 flex gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-bold text-primary">
            ● 7-day streak
          </span>
          <span className="rounded-full bg-track px-3 py-1 text-[12px] font-bold text-muted-foreground">
            3 badges
          </span>
        </div>
      </div>
    </section>
  );
}
