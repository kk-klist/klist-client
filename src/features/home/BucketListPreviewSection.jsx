import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useBucketListPreviewQuery } from './homeApi';
import { LoginPromptCard } from './LoginPromptCard';

const CATEGORY_META = {
  K_POP: { label: 'K-POP', color: 'text-kpop', grad: 'kb-grad-kpop' },
  K_DRAMA: { label: 'K-DRAMA', color: 'text-kdrama', grad: 'kb-grad-kdrama' },
  K_FOOD: { label: 'K-FOOD', color: 'text-kfood', grad: 'kb-grad-kfood' },
  K_BEAUTY: { label: 'K-BEAUTY', color: 'text-kbeauty', grad: 'kb-grad-kbeauty' },
};
const DEFAULT_CATEGORY_META = { label: 'K-CULTURE', color: 'text-primary', grad: 'kb-grad-kpop' };

export function BucketListPreviewSection() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBucketListPreviewQuery({ enabled: isAuthenticated });
  const items = data ?? [];

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="kb-section">My bucket list</h2>
        <button
          type="button"
          className="text-[13px] font-bold text-muted-foreground"
          onClick={() => navigate('/bucket')}
        >
          View all ›
        </button>
      </div>

      <div className="mt-3">
        {!isAuthenticated && <LoginPromptCard message="로그인하고 버킷리스트 확인하기" />}
        {isAuthenticated && isLoading && <Spinner />}
        {isAuthenticated && !isLoading && isError && (
          <ErrorMessage message="버킷리스트를 불러올 수 없어요." />
        )}
        {isAuthenticated && !isLoading && !isError && items.length === 0 && (
          <EmptyState message="아직 등록한 버킷리스트가 없어요." />
        )}
        {isAuthenticated && !isLoading && !isError && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const category = CATEGORY_META[item.category] ?? DEFAULT_CATEGORY_META;
              return (
                <div key={item.id} className="kb-card flex items-center gap-3.5 p-3.5">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-thumb object-cover"
                    />
                  ) : (
                    <span className={cn('h-16 w-16 shrink-0 rounded-thumb', category.grad)} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={cn('kb-cat-label', category.color)}>{category.label}</p>
                    <p className="truncate text-[15px] font-extrabold">{item.title}</p>
                    {item.placeName && (
                      <p className="truncate text-[13px] text-muted-foreground">{item.placeName}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold',
                      item.isCompleted
                        ? 'border-success bg-success text-white'
                        : 'border-line2 bg-card text-transparent',
                    )}
                  >
                    {item.isCompleted && '✓'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
