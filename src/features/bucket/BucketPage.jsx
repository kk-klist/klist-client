import { useState } from 'react';
import { cn } from '@/shared/utils/cn';

// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시 파일] 버킷리스트 — 담당: 버킷 담당자
//
// ✂️ 이 파일은 "참고용 예시"입니다. 디자인/구조가 마음에 안 들면
//    이 파일 전체를 지우고 새로 작성해도 됩니다. (라우터 등록만 유지)
//    단, 두 가지만 지켜주세요:
//    ① 색은 tailwind.config.js 토큰 이름만 사용 (직접 색상코드 금지)
//    ② 다른 기능 폴더(features/*) import 금지
//    → 자세한 규칙: docs/디자인_기준문서.md, docs/프론트엔드_기준문서.md
//
// TODO(담당자): GET /api/v1/bucket 연동, 상태/장르 필터 쿼리, 체크 토글
// ═══════════════════════════════════════════════════════════════

const ITEMS = [
  {
    cat: 'K-DRAMA',
    color: 'text-kdrama',
    title: 'Wear Hanbok at Gyeongbokgung',
    place: 'Gyeongbokgung',
    done: true,
    grad: 'kb-grad-kdrama',
  },
  {
    cat: 'K-BEAUTY',
    color: 'text-kbeauty',
    title: 'Get a Personal Color analysis',
    place: 'Myeongdong',
    done: false,
    grad: 'kb-grad-kbeauty',
  },
  {
    cat: 'K-POP',
    color: 'text-kpop',
    title: 'Watch street busking in Hongdae',
    place: 'Hongdae',
    done: true,
    grad: 'kb-grad-kpop',
  },
  {
    cat: 'K-POP',
    color: 'text-kpop',
    title: 'Photo at the HYBE building',
    place: 'HYBE, Yongsan',
    done: false,
    grad: 'kb-grad-kpop',
  },
  {
    cat: 'K-FOOD',
    color: 'text-kfood',
    title: 'Eat tteokbokki in Myeongdong',
    place: 'Myeongdong',
    done: false,
    grad: 'kb-grad-kfood',
  },
  {
    cat: 'K-FOOD',
    color: 'text-kfood',
    title: 'Café hopping in Seongsu',
    place: 'Seongsu-dong',
    done: false,
    grad: 'kb-grad-kfood',
  },
  {
    cat: 'K-DRAMA',
    color: 'text-kdrama',
    title: 'Visit an Itaewon Class spot',
    place: 'Itaewon',
    done: false,
    grad: 'kb-grad-kdrama',
  },
];

const STATUS = ['All', 'To do', 'Completed'];
const GENRES = ['All', 'K-POP', 'K-DRAMA', 'K-FOOD', 'K-BEAUTY'];

export default function BucketPage() {
  const [status, setStatus] = useState('All');
  const [genre, setGenre] = useState('All');

  const filtered = ITEMS.filter(
    (it) =>
      (status === 'All' || (status === 'Completed') === it.done) &&
      (genre === 'All' || it.cat === genre),
  );

  return (
    <div className="kb-page">
      <h1 className="kb-title">Bucket list</h1>

      {/* 상태 세그먼트 */}
      <div className="kb-segment">
        {STATUS.map((s) => (
          <button
            key={s}
            type="button"
            className={cn('kb-segment__btn', status === s && 'kb-segment__btn--active')}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 장르 칩 */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            className={cn('kb-chip', genre === g && 'kb-chip--active')}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      <div className="flex flex-col gap-3">
        {filtered.map((it) => (
          <div key={it.title} className="kb-card flex items-center gap-3.5 p-3.5">
            <div className={cn('relative h-[72px] w-[72px] shrink-0 rounded-thumb p-1.5', it.grad)}>
              <p className="absolute bottom-1.5 left-1.5 text-[10px] font-bold leading-tight text-white">
                {it.place}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('kb-cat-label', it.color)}>{it.cat}</p>
              <p className="text-[15px] font-extrabold leading-snug">{it.title}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {it.done ? '✓ Completed' : 'To do'}
              </p>
            </div>
            <span className={cn('kb-check', it.done ? 'kb-check--done' : 'kb-check--todo')}>
              {it.done && '✓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
