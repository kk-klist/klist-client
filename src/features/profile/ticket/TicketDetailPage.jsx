import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시] 티켓 상세 (스펙 2.7) + QR 공유 모달 (2.8) — 담당: 티켓 담당자
//
// ✂️ 러프 목값. GET /tickets/{id}(Read only) + 스냅샷 목록 연동은 담당자가.
//    ① 색은 tailwind 토큰만 ② 다른 features import 금지 → docs 참고
// ═══════════════════════════════════════════════════════════════

const COMPLETED = [
  { title: '경복궁에서 한복 입기', date: '07.12' },
  { title: '홍대에서 버스킹 보기', date: '07.14' },
  { title: '남산타워 사랑의 자물쇠', date: '07.16' },
];
const SAVED = ['명동 떡볶이 골목', '성수 카페거리', '하이브 사옥'];

export default function TicketDetailPage() {
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="mx-auto flex h-full max-w-[520px] flex-col bg-surface">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3 pt-[calc(12px+env(safe-area-inset-top))]">
        <button type="button" onClick={() => navigate('/my')} className="text-[20px]">
          ‹
        </button>
        <h1 className="text-[17px] font-extrabold">티켓 상세</h1>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {/* 티켓 카드 */}
        <div className="overflow-hidden rounded-card shadow-card">
          <div className="flex items-center justify-between bg-brand-gradient px-4 py-2.5 text-white">
            <span className="text-[12px] font-extrabold tracking-wide">
              K-BUCKET · TRAVEL TICKET
            </span>
            <span className="text-[11px] font-bold opacity-80">NO.001</span>
          </div>
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
                <p className="mt-1 text-[12px] text-muted-foreground">SEOUL</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-dashed border-line pt-3 text-[13px]">
              <Cell label="기간" value="07.12 – 07.18" />
              <Cell label="방문 회수" value="1번째" />
              <Cell label="완료 버킷" value="3개" valueClass="text-success" />
            </div>
          </div>
        </div>

        {/* 완료한 버킷리스트 */}
        <section>
          <h2 className="text-[16px] font-extrabold">
            완료한 버킷리스트 <span className="text-primary">{COMPLETED.length}</span>
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {COMPLETED.map((c) => (
              <div key={c.title} className="kb-card flex items-center gap-3 p-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-[13px] text-white">
                  ✓
                </span>
                <p className="flex-1 text-[14px] font-bold">{c.title}</p>
                <span className="text-[13px] text-muted-foreground">{c.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 저장한 장소 */}
        <section>
          <h2 className="text-[16px] font-extrabold">
            저장한 장소 <span className="text-primary">12</span>
          </h2>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {SAVED.map((s) => (
              <span key={s} className="kb-chip">
                {s}
              </span>
            ))}
            <span className="kb-chip">+9</span>
          </div>
        </section>
      </div>

      {/* QR 보기 CTA */}
      <div className="shrink-0 border-t border-line bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <button type="button" className="kb-btn w-full" onClick={() => setQrOpen(true)}>
          🔳 QR 코드 보기
        </button>
      </div>

      {/* QR 공유 모달 (2.8) */}
      {qrOpen && <QrShareModal onClose={() => setQrOpen(false)} />}
    </div>
  );
}

function Cell({ label, value, valueClass }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 font-extrabold', valueClass)}>{value}</p>
    </div>
  );
}

// QR 공유 모달 — 로그인 없이 공개 뷰 링크
function QrShareModal({ onClose }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-ink/50 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-card bg-white p-5 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[11px] font-extrabold text-primary">
          TICKET NO.001
        </span>
        <span className="ml-2 text-[12px] text-muted-foreground">ICN → SEL · 07.12–07.18</span>

        {/* QR 플레이스홀더 */}
        <div className="mx-auto my-5 grid h-44 w-44 grid-cols-8 grid-rows-8 gap-0.5 rounded-thumb bg-white p-2 ring-1 ring-line">
          {Array.from({ length: 64 }).map((_, i) => (
            <span key={i} className={(i * 7 + (i % 5)) % 3 === 0 ? 'bg-ink' : 'bg-transparent'} />
          ))}
        </div>

        <p className="text-center text-[15px] font-extrabold">QR을 스캔하면 누구나 볼 수 있어요</p>
        <p className="mt-1 text-center text-[12px] text-muted-foreground">
          로그인 없이 티켓 공개 뷰로 연결됩니다.
        </p>

        <div className="mt-4 rounded-thumb bg-track px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
          · 본인 소유 티켓만 공유할 수 있어요
          <br />· 탈퇴한 사용자의 티켓은 더 이상 열리지 않아요
        </div>

        <div className="mt-4 flex gap-2.5">
          <button type="button" className="kb-btn--outline flex-1">
            🔗 링크 복사
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-ink py-3.5 text-[15px] font-bold text-white"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
