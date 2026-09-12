import { useSelector } from 'react-redux';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useBucketProgressQuery } from './homeApi';
import { useHomeCopy } from './homeLocale';
import { ProgressDonut } from './ProgressDonut';
import { LoginPromptCard } from './LoginPromptCard';

export function BucketProgressCard() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, isError } = useBucketProgressQuery({ enabled: isAuthenticated });
  const copy = useHomeCopy();

  if (!isAuthenticated) {
    return <LoginPromptCard message={copy.loginPromptProgress} />;
  }

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={copy.progressError} />;
  if (!data || data.totalCount === 0) {
    return <EmptyState message={copy.progressEmpty} />;
  }

  return (
    <section className="kb-card flex items-center gap-5 p-5">
      <ProgressDonut percent={Math.round(data.progressRate)} />
      <div className="flex-1">
        <p className="text-[13px] text-muted-foreground">{copy.progressLabel}</p>
        <p className="text-[22px] font-extrabold">
          {data.completedCount}{' '}
          <span className="text-muted-foreground">
            / {data.totalCount} {copy.done}
          </span>
        </p>
        <div className="mt-2 flex gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-bold text-primary">
            ● {copy.streak}
          </span>
          <span className="rounded-full bg-track px-3 py-1 text-[12px] font-bold text-muted-foreground">
            {copy.badges}
          </span>
        </div>
      </div>
    </section>
  );
}
