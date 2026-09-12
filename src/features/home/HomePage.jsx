import { useSelector } from 'react-redux';
import { PageHeader } from '@/shared/components/PageHeader';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { WeatherOutfitCard } from './WeatherOutfitCard';
import { NearbyRecommendSection } from './NearbyRecommendSection';
import { BucketProgressCard } from './BucketProgressCard';
import { NearbyCheckinCard } from './NearbyCheckinCard';
import { BucketListPreviewSection } from './BucketListPreviewSection';
import { HomeLocaleProvider } from './HomeLocaleProvider';
import { useHomeCopy } from './homeLocale';

function HomePageContent() {
  const user = useSelector(selectCurrentUser);
  const copy = useHomeCopy();

  return (
    <div className="kb-page">
      <PageHeader title="Home" />

      {/* 인사 */}
      <div>
        <h1 className="kb-title">{copy.greeting(user?.nickname)} 👋</h1>
      </div>

      {/* 진행률 카드 */}
      <BucketProgressCard />

      {/* 근처 체크인 카드 */}
      <NearbyCheckinCard />

      {/* 날씨 + 오늘의 추천 복장 카드 */}
      <WeatherOutfitCard />

      {/* Do it now · near you */}
      <NearbyRecommendSection />

      {/* My bucket list 미리보기 */}
      <BucketListPreviewSection />
    </div>
  );
}

export default function HomePage() {
  const language = useSelector(selectCurrentUser)?.preferredLanguage;

  return (
    <HomeLocaleProvider language={language}>
      <HomePageContent />
    </HomeLocaleProvider>
  );
}
