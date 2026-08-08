import { cn } from '@/shared/utils/cn';

// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시] 여행 종료 · 기간 선택 (스펙 2.6) — 담당: 티켓 담당자
//
// ✂️ 러프 목값 캘린더. 실제 날짜 선택/검증(미래·중복 disabled, 기간 겹침 경고)은 담당자가.
// ═══════════════════════════════════════════════════════════════

// 2026년 7월 러프 목값 (일 시작). null = 빈칸, disabled/selected/inRange 상태
const DAYS = [
  null,
  null,
  null,
  { d: 1, dis: true },
  { d: 2, dis: true },
  { d: 3, dis: true },
  { d: 4, dis: true },
  { d: 5, dis: true },
  { d: 6 },
  { d: 7 },
  { d: 8 },
  { d: 9 },
  { d: 10 },
  { d: 11 },
  { d: 12, start: true },
  { d: 13, mid: true },
  { d: 14, mid: true },
  { d: 15, mid: true },
  { d: 16, mid: true },
  { d: 17, mid: true },
  { d: 18, end: true },
  { d: 19 },
  { d: 20 },
  { d: 21, dis: true },
  { d: 22, dis: true },
  { d: 23, dis: true },
  { d: 24, dis: true },
  { d: 25, dis: true },
  { d: 26, dis: true },
  { d: 27, dis: true },
  { d: 28, dis: true },
  { d: 29, dis: true },
  { d: 30, dis: true },
  { d: 31, dis: true },
];
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function EndTripSheet({ onClose, onCreate }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-ink/50" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[520px] animate-slideup rounded-t-[20px] bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line2" />
        <h2 className="text-[20px] font-extrabold">여행 기간 선택</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          미래 날짜와 이미 기록된 여행 기간은 선택할 수 없어요.
        </p>

        {/* 월 네비 */}
        <div className="mt-4 flex items-center justify-between">
          <button type="button" className="px-2 text-muted-foreground">
            ‹
          </button>
          <span className="text-[15px] font-extrabold">2026년 7월</span>
          <button type="button" className="px-2 text-muted-foreground">
            ›
          </button>
        </div>

        {/* 요일 */}
        <div className="mt-2 grid grid-cols-7 text-center text-[12px] text-muted-foreground">
          {WEEK.map((w) => (
            <span key={w} className="py-1">
              {w}
            </span>
          ))}
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-[14px]">
          {DAYS.map((c, i) => (
            <div key={i} className="flex h-10 items-center justify-center">
              {c && (
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    c.dis && 'text-muted2/50',
                    c.mid && 'bg-primary-soft font-bold text-primary',
                    (c.start || c.end) && 'bg-primary font-bold text-white',
                    !c.dis && !c.mid && !c.start && !c.end && 'font-semibold',
                  )}
                >
                  {c.d}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
          <Legend cls="bg-primary" label="선택 기간" />
          <Legend cls="bg-track" label="이미 기록됨" />
          <Legend cls="ring-1 ring-line2 bg-white" label="선택 불가" />
        </div>

        {/* 요약 */}
        <div className="mt-3 rounded-thumb bg-success/10 px-3.5 py-2.5 text-[13px] font-semibold text-success">
          7월 12일 – 7월 18일 · 완료 버킷 3개가 티켓에 담겨요
        </div>

        {/* 버튼 */}
        <div className="mt-4 flex gap-2.5">
          <button type="button" className="kb-btn--outline flex-1" onClick={onClose}>
            취소
          </button>
          <button type="button" className="kb-btn flex-1" onClick={onCreate}>
            티켓 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend({ cls, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('h-3 w-3 rounded-full', cls)} />
      {label}
    </span>
  );
}
