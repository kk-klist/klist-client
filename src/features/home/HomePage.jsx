import { useSelector } from 'react-redux';
import { cn } from '@/shared/utils/cn';
import { PageHeader } from '@/shared/components/PageHeader';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { WeatherOutfitCard } from './WeatherOutfitCard';
import { NearbyRecommendSection } from './NearbyRecommendSection';
import { BucketProgressCard } from './BucketProgressCard';

// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시 파일] 홈 — 담당: 홈 담당자
//
// ✂️ 이 파일은 "참고용 예시"입니다. 디자인/구조가 마음에 안 들면
//    이 파일 전체를 지우고 새로 작성해도 됩니다. (라우터 등록만 유지)
//    단, 두 가지만 지켜주세요:
//    ① 색은 tailwind.config.js 토큰 이름만 사용 (직접 색상코드 금지)
//    ② 다른 기능 폴더(features/*) import 금지
//    → 자세한 규칙: docs/디자인_기준문서.md, docs/프론트엔드_기준문서.md
//
// TODO(담당자): 근처 체크인/버킷 미리보기 실데이터 연동
// ═══════════════════════════════════════════════════════════════

const BUCKET_PREVIEW = [
  {
    cat: 'K-DRAMA',
    color: 'text-kdrama',
    title: 'Wear Hanbok at Gyeongbokgung',
    sub: 'Gyeongbokgung',
    done: true,
    grad: 'kb-grad-kdrama',
  },
  {
    cat: 'K-BEAUTY',
    color: 'text-kbeauty',
    title: 'Get a Personal Color analysis',
    sub: 'Myeongdong',
    done: false,
    grad: 'kb-grad-kbeauty',
  },
  {
    cat: 'K-POP',
    color: 'text-kpop',
    title: 'Watch street busking in Hongdae',
    sub: 'Hongdae',
    done: true,
    grad: 'kb-grad-kpop',
  },
];

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
      <section>
        <div className="flex items-center justify-between">
          <h2 className="kb-section">My bucket list</h2>
          <button type="button" className="text-[13px] font-bold text-muted-foreground">
            View all ›
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {BUCKET_PREVIEW.map((b) => (
            <div key={b.title} className="kb-card flex items-center gap-3.5 p-3.5">
              <span className={cn('h-16 w-16 shrink-0 rounded-thumb', b.grad)} />
              <div className="min-w-0 flex-1">
                <p className={cn('kb-cat-label', b.color)}>{b.cat}</p>
                <p className="truncate text-[15px] font-extrabold">{b.title}</p>
                <p className="text-[13px] text-muted-foreground">{b.sub}</p>
              </div>
              <span className={cn('kb-check', b.done ? 'kb-check--done' : 'kb-check--todo')}>
                {b.done && '✓'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
