// ═══════════════════════════════════════════════════════════════
// [디자인 깡통 · 예시 파일] AI 어시스트 (K-Buddy) — 담당: 챗봇 담당자
//
// ✂️ 이 파일은 "참고용 예시"입니다. 디자인/구조가 마음에 안 들면 전체를
//    지우고 새로 작성해도 됩니다. (라우터 등록만 유지)
//    ① 색은 tailwind.config.js 토큰 이름만 ② 다른 features 폴더 import 금지
//    → docs/디자인_기준문서.md, docs/프론트엔드_기준문서.md
//
// TODO(담당자): 세션/메시지 API 연동, LLM tool → GET /api/v1/recommend 호출,
//               봇 응답 places[] → [지도에서 보기] 딥링크(/map?ids=...)
// ═══════════════════════════════════════════════════════════════

const SUGGESTIONS = ['K-pop spots near me', 'Where to eat tteokbokki?', 'Plan my day in Hongdae'];

export default function AssistPage() {
  return (
    <div className="mx-auto flex h-full max-w-[520px] flex-col">
      {/* 헤더 (고정) */}
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 pb-3 pt-[calc(14px+env(safe-area-inset-top))]">
        <span className="kb-logo h-11 w-11 text-lg">🤖</span>
        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight">K-Buddy</h1>
          <p className="text-[12px] font-semibold text-success">● Online · AI travel assistant</p>
        </div>
      </header>

      {/* 대화 영역 (스크롤, 남은 공간 전부 차지) */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <Bubble>
          Annyeong! 👋 I can recommend K-pop, K-drama, K-food and K-beauty spots. What are you in
          the mood for today?
        </Bubble>

        <div className="ml-auto max-w-[85%] rounded-card rounded-br-md bg-primary px-4 py-3 text-[14px] font-semibold leading-relaxed text-white">
          Show me popular K-pop spots near Hongdae!
        </div>

        <Bubble>
          Here are the most-saved spots 🔥
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-thumb bg-primary-soft p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
                📍
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-extrabold">Watch street busking</p>
                <p className="text-[12px] text-muted-foreground">Hongdae · 87 saved</p>
              </div>
            </div>
            <button type="button" className="kb-btn py-2.5 text-[13px]">
              View on map ›
            </button>
          </div>
        </Bubble>
      </div>

      {/* 하단 고정 영역: 추천칩 + 입력바 */}
      <div className="shrink-0 border-t border-line bg-white px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        <div className="no-scrollbar -mx-5 mb-2.5 flex gap-2 overflow-x-auto px-5">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="kb-chip">
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-primary-soft py-1.5 pl-5 pr-1.5">
          <input
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted2"
            placeholder="Ask K-Buddy anything…"
            disabled
          />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-float"
            aria-label="보내기"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

// 봇 말풍선 (흰 카드, 왼쪽 꼬리)
function Bubble({ children }) {
  return (
    <div className="max-w-[85%] rounded-card rounded-tl-md border border-line bg-white px-4 py-3 text-[14px] leading-relaxed shadow-card">
      {children}
    </div>
  );
}
