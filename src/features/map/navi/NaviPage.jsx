import { useNavigate, useLocation } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시 파일] Kakao Navi (길찾기) — 담당: 지도 담당
//
// ✂️ 러프 목업. 실제 턴바이턴은 카카오내비 SDK 딥링크로 연결(담당자).
//    Map 의 Find Route → 이 화면. 데이터는 route 요약(거리/시간) 목값.
// ═══════════════════════════════════════════════════════════════
export default function NaviPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const title = state?.title ?? '목적지';
  const km = state?.distanceM ? (state.distanceM / 1000).toFixed(1) : '4.4';
  const min = state?.durationSec ? Math.round(state.durationSec / 60) : 14;

  return (
    <div className="fixed inset-0 mx-auto flex max-w-[560px] flex-col bg-ink">
      {/* 상단 턴 안내 카드 */}
      <div className="bg-primary px-5 pb-4 pt-[calc(14px+env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            ↱
          </span>
          <div>
            <p className="text-[26px] font-extrabold leading-none">120m</p>
            <p className="mt-1 text-[14px] font-semibold opacity-90">Turn right · Myeongdong-gil</p>
          </div>
        </div>
        <p className="mt-3 border-t border-white/20 pt-2.5 text-[13px] opacity-80">
          ↱ then 300m · turn left at Myeongdong Station
        </p>
      </div>

      {/* 지도 영역 (러프 다크 플레이스홀더) */}
      <div className="relative flex-1 overflow-hidden bg-[#1c1a22]">
        {/* 러프 경로선 */}
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d="M20 95 L20 55 L60 55 L60 20"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* 내 위치 */}
        <span className="absolute bottom-[8%] left-[18%] flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-primary ring-4 ring-primary/30" />
        <p className="absolute bottom-4 right-4 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/60">
          카카오내비 SDK 연결 예정
        </p>
      </div>

      {/* 하단 ETA 바 */}
      <div className="flex items-center gap-3 bg-white px-5 py-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="flex-1">
          <p className="text-[18px] font-extrabold">
            {min}분 <span className="font-semibold text-muted-foreground">· {km}km</span>
          </p>
          <p className="text-[13px] text-muted-foreground">→ {title}</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-white"
          onClick={() => navigate('/map')}
        >
          종료
        </button>
      </div>
    </div>
  );
}
