import { useMapPage } from './useMapPage';
import { SearchBar } from './SearchBar';
import { CategoryTabs, GenreChips } from './CategoryTabs';
import { PlaceSheet } from './PlaceSheet';

// 지도 페이지 (화면정의서 v2) — 전체화면 카카오맵 + 상단 검색/칩 오버레이 + 우하단 현재위치 + 바텀시트.
// 화면만 그리고 실제 일은 useMapPage 훅에 위임 (기준문서: 컴포넌트=Controller)
export default function MapPage() {
  const {
    registerMapEl,
    ready,
    noKey,
    active,
    genre,
    loading,
    selected,
    detail,
    detailLoading,
    routing,
    selectedSaved,
    selectedVisited,
    onSearch,
    onChangeCategory,
    onGenre,
    onLocate,
    onFindRoute,
    onSave,
    onCheckoff,
    closeSheet,
  } = useMapPage();

  // 길찾기: 지도 위에 백엔드 route API(/api/v1/route/directions) 경로를 폴리라인으로 그린다.
  // 실패 시 useMapPage 내부에서 카카오맵 웹 딥링크로 폴백.
  // (이전엔 /navi mockup 화면으로 navigate 했지만 실제 지도 없어서 폴리라인 방식으로 교체)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 전체화면 카카오맵 */}
      <div ref={registerMapEl} className="absolute inset-0 bg-track" />

      {/* 상단 오버레이: 검색 + 필터칩 (지도 위에 떠 있음) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-4 pt-[calc(14px+env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <SearchBar onSearch={onSearch} />
        </div>
        <div className="pointer-events-auto">
          <CategoryTabs active={active} onChange={onChangeCategory} />
        </div>
        {active === 'recommend' && (
          <div className="pointer-events-auto">
            <GenreChips genre={genre} onGenre={onGenre} />
          </div>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/80 px-4 py-2 text-[13px] text-white">
          불러오는 중…
        </div>
      )}

      {/* 현재 위치 FAB (지도 위 우하단, 바텀시트 없을 때만) */}
      {!selected && (
        <button
          type="button"
          className="absolute bottom-5 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-float"
          onClick={onLocate}
          aria-label="현재 위치"
        >
          🎯
        </button>
      )}

      {/* SDK 로딩/키 안내 */}
      {(!ready || noKey) && (
        <div className="absolute left-1/2 top-1/2 z-20 w-4/5 max-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-white px-4 py-3 text-center text-[13px] text-muted-foreground shadow-card">
          {noKey ? 'VITE_KAKAO_JS_KEY 설정 후 dev 서버 재시작' : '지도 로딩 중…'}
        </div>
      )}

      {/* 상세 바텀시트 */}
      <PlaceSheet
        place={selected}
        detail={detail}
        loading={detailLoading}
        saved={selectedSaved}
        visited={selectedVisited}
        routing={routing}
        onClose={closeSheet}
        onFindRoute={onFindRoute}
        onSave={onSave}
        onCheckoff={onCheckoff}
      />
    </div>
  );
}
