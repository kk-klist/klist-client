import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시 파일] 마이페이지 — 담당: 프로필 담당자
//
// ✂️ 이 파일은 "참고용 예시"입니다. 디자인/구조가 마음에 안 들면
//    이 파일 전체를 지우고 새로 작성해도 됩니다. (라우터 등록만 유지)
//    단, 두 가지만 지켜주세요:
//    ① 색은 tailwind.config.js 토큰 이름만 사용 (직접 색상코드 금지)
//    ② 다른 기능 폴더(features/*) import 금지
//    → 자세한 규칙: docs/디자인_기준문서.md, docs/프론트엔드_기준문서.md
//
// TODO(담당자): GET /users/me 연동, 뱃지/통계 실데이터, 언어 변경(지도 lang 연동), 온보딩 재시작
// ═══════════════════════════════════════════════════════════════

const BADGES = [
  { name: 'Gyeongbokgung', earned: true, grad: 'kb-grad-kdrama', ring: 'ring-kdrama' },
  { name: 'Myeongdong', earned: false },
  { name: 'Hongdae', earned: true, grad: 'kb-grad-kpop', ring: 'ring-kpop' },
  { name: 'HYBE, Yongsan', earned: false },
  { name: 'Myeongdong', earned: false },
  { name: 'Seongsu-dong', earned: false },
  { name: 'Itaewon', earned: false },
  { name: 'N Seoul Tower', earned: true, grad: 'kb-grad-kdrama', ring: 'ring-kdrama' },
  { name: 'Gwanghwamun', earned: false },
];

const STATS = [
  { value: 3, label: 'Completed' },
  { value: 3, label: 'Badges' },
  { value: 7, label: 'Day streak' },
];

export default function MyPage() {
  const navigate = useNavigate();
  return (
    <div className="kb-page">
      {/* 프로필 */}
      <header className="flex items-center gap-4 pt-1">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-2xl font-extrabold text-white shadow-float">
          Y
        </span>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Yuna</h1>
          <p className="text-[14px] text-muted-foreground">Visiting Seoul · since 2026</p>
        </div>
      </header>

      {/* 통계 3카드 */}
      <div className="flex gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="kb-card flex-1 py-4 text-center">
            <p className="text-[24px] font-extrabold text-primary">{s.value}</p>
            <p className="text-[12px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* My tickets (스펙 2.5 — 항공권 카드) */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="kb-section">My tickets</h2>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white"
            onClick={() => navigate('/ticket/new')}
          >
            End trip
          </button>
        </div>

        <button
          type="button"
          className="mt-3 block w-full overflow-hidden rounded-card text-left shadow-card"
          onClick={() => navigate('/ticket')}
        >
          {/* 티켓 헤더 (보라 스텁) */}
          <div className="flex items-center justify-between bg-brand-gradient px-4 py-2.5 text-white">
            <span className="text-[12px] font-extrabold tracking-wide">
              K-BUCKET · TRAVEL TICKET
            </span>
            <span className="text-[11px] font-bold opacity-80">NO.001</span>
          </div>

          {/* 티켓 본문 (항공권) */}
          <div className="bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[26px] font-extrabold leading-none">ICN</p>
                <p className="mt-1 text-[12px] text-muted-foreground">INCHEON</p>
              </div>
              <div className="mx-3 flex-1 border-t border-dashed border-line2" />
              <span className="text-primary">✈</span>
              <div className="mx-3 flex-1 border-t border-dashed border-line2" />
              <div className="text-right">
                <p className="text-[26px] font-extrabold leading-none">SEL</p>
                <p className="mt-1 text-[12px] text-muted-foreground">SEOUL · 1st VISIT</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 text-[13px]">
              <span className="font-bold">2026.07.12 – 07.18</span>
              <span className="font-bold text-success">완료 3</span>
              <span className="text-muted-foreground">저장 12</span>
            </div>
          </div>
        </button>
        <p className="mt-2 text-[12px] text-muted2">
          티켓을 누르면 상세 화면으로 이동해요 · 여행 종료로 새 티켓을 만들 수 있어요
        </p>
      </section>

      {/* 뱃지 그리드 */}
      <section>
        <h2 className="kb-section">My badges</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {BADGES.map((b, i) => (
            <div key={`${b.name}-${i}`} className="text-center">
              <div
                className={cn(
                  'mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-thumb',
                  b.earned ? cn('ring-2 ring-offset-2', b.ring, b.grad) : 'bg-track',
                )}
              >
                {b.earned ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 font-bold text-white">
                    ✓
                  </span>
                ) : (
                  <span className="h-8 w-8 rounded-xl bg-line" />
                )}
              </div>
              <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{b.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 설정 */}
      <section>
        <h2 className="kb-section">Settings</h2>
        <div className="kb-card mt-3 divide-y divide-line">
          <SettingRow icon="A문" label="Language" value="English" valueClass="text-primary" />
          <SettingRow
            icon="🛡"
            label="My interests"
            value="4/4"
            valueClass="text-muted-foreground"
          />
        </div>
        <button type="button" className="kb-btn--outline mt-3 w-full">
          Restart onboarding
        </button>
      </section>
    </div>
  );
}

function SettingRow({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-center gap-3.5 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-track text-[13px] font-bold">
        {icon}
      </span>
      <p className="flex-1 text-[15px] font-bold">{label}</p>
      <p className={cn('text-[14px] font-bold', valueClass)}>{value}</p>
    </div>
  );
}
