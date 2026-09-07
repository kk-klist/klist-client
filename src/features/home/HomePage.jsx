import { useSelector } from 'react-redux';
import { PageHeader } from '@/shared/components/PageHeader';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { WeatherOutfitCard } from './WeatherOutfitCard';
import { NearbyRecommendSection } from './NearbyRecommendSection';
import { BucketProgressCard } from './BucketProgressCard';
import { BucketListPreviewSection } from './BucketListPreviewSection';

export default function HomePage() {
  const user = useSelector(selectCurrentUser);
  const isKorean = user?.preferredLanguage === 'ko';
  const name = user?.nickname;

  return (
    <div className="kb-page">
      <PageHeader title="Home" />

      {/* 인사 */}
      <div>
        <h1 className="kb-title">
          {isKorean
            ? name
              ? `안녕하세요, ${name}님`
              : '안녕하세요'
            : name
              ? `Hi, ${name}`
              : 'Hi there'}{' '}
          👋
        </h1>
      </div>

      {/* 진행률 카드 */}
      <BucketProgressCard />

      {/* 근처 체크인 카드 */}
      <section className="flex items-center gap-4 rounded-card border border-primary/20 bg-primary-soft p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-primary">
          📍
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-extrabold">You’re nearby · Myeongdong</p>
          <p className="text-[13px] text-muted-foreground">Tap to check in & complete</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
          ›
        </span>
      </section>

      {/* 날씨 + 오늘의 추천 복장 카드 */}
      <WeatherOutfitCard />

      {/* Do it now · near you */}
      <NearbyRecommendSection />

      {/* My bucket list 미리보기 */}
      <BucketListPreviewSection />
    </div>
  );
}
