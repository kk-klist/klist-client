import { cn } from '@/shared/utils/cn';
import { WeatherOutfitCard } from './WeatherOutfitCard';

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
// TODO(담당자): 진행률/근처 체크인/날씨/근처 추천/버킷 미리보기 실데이터 연동
// ═══════════════════════════════════════════════════════════════

const NEARBY_CARDS = [
  {
    cat: 'K-BEAUTY',
    place: 'Myeongdong',
    title: 'Get a Personal Color analysis',
    dist: '350 m',
    grad: 'kb-grad-kbeauty',
  },
  {
    cat: 'K-FOOD',
    place: 'Myeongdong',
    title: 'Eat tteokbokki in Myeongdong',
    dist: '400 m',
    grad: 'kb-grad-kfood',
  },
  {
    cat: 'K-POP',
    place: 'Hongdae',
    title: 'Watch street busking',
    dist: '1.2 km',
    grad: 'kb-grad-kpop',
  },
];

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
  return (
    <div className="kb-page">
      {/* 헤더: 로고 + 언어 토글 */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="kb-logo h-10 w-10 text-lg">K</span>
          <span className="text-[20px] font-extrabold tracking-tight">BUCKET</span>
        </div>
        <div className="flex items-center rounded-full bg-track p-1 text-[13px] font-bold">
          <button type="button" className="rounded-full bg-ink px-3.5 py-1.5 text-white">
            EN
          </button>
          <button type="button" className="px-3 py-1.5 text-muted-foreground">
            한
          </button>
        </div>
      </header>

      {/* 인사 */}
      <div>
        <h1 className="kb-title">Annyeong, Yuna 👋</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Seoul is waiting for you today.</p>
      </div>

      {/* 진행률 카드 */}
      <section className="kb-card flex items-center gap-5 p-5">
        <ProgressDonut percent={33} />
        <div className="flex-1">
          <p className="text-[13px] text-muted-foreground">Bucket list progress</p>
          <p className="text-[22px] font-extrabold">
            3 <span className="text-muted-foreground">/ 9 done</span>
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
      <section>
        <div className="flex items-center justify-between">
          <h2 className="kb-section">Do it now · near you</h2>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-extrabold text-primary">
            LIVE
          </span>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5">
          {NEARBY_CARDS.map((c) => (
            <div key={c.title} className="w-44 shrink-0">
              <div className={cn('relative h-40 rounded-thumb p-3', c.grad)}>
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white">
                  {c.cat}
                </span>
                <p className="absolute bottom-3 left-3 text-[15px] font-extrabold text-white">
                  {c.place}
                </p>
              </div>
              <p className="mt-2 text-[14px] font-bold leading-snug">{c.title}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">📍 {c.dist}</p>
            </div>
          ))}
        </div>
      </section>

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

// 진행률 도넛 (SVG)
function ProgressDonut({ percent }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84">
      <circle cx="42" cy="42" r={r} fill="none" stroke="#f0eef3" strokeWidth="9" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="#7131F5"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(c * percent) / 100} ${c}`}
        transform="rotate(-90 42 42)"
      />
      <text x="42" y="47" textAnchor="middle" fontSize="17" fontWeight="800" fill="#16131a">
        {percent}
        <tspan fontSize="10" fill="#8a8792">
          %
        </tspan>
      </text>
    </svg>
  );
}
