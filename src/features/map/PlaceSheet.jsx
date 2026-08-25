import { cn } from '@/shared/utils/cn';

// TourAPI 텍스트에 섞여오는 <br> 등 HTML 태그 정리
function cleanHtml(s) {
  if (!s) return null;
  const out = s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return out || null;
}

// 장소 상세 바텀시트 (F-15~F-20)
// 저장 버튼 = 토글 (저장↔저장취소). 방문 인증 = 100m 이내 도착 시 그린 마커 + 뱃지.
export function PlaceSheet({
  place,
  detail,
  loading,
  saved,
  visited,
  routing,
  onClose,
  onFindRoute,
  onOpenKakaoNavi,
  onSave,
  onCheckoff,
}) {
  if (!place) return null;

  const title = detail?.title ?? place.title;
  const addr = detail?.addr ?? place.addr;
  const thumb = detail?.thumbnail ?? place.thumbnail;
  const useTime = cleanHtml(detail?.useTime);
  const overview = cleanHtml(detail?.overview);
  const inBucket = saved || place.inBucket;
  // 저장 버튼 스타일/라벨은 toggle 상태로 결정
  const saveLabel = inBucket ? '↩ 저장취소' : '🔖 저장';
  const saveBtnClass = inBucket
    ? 'bg-white text-primary border border-primary'
    : 'bg-primary text-white';

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-40 mx-auto max-h-[72dvh] max-w-[520px] animate-slideup overflow-y-auto rounded-t-[20px] bg-white px-4 pb-5 pt-2.5 shadow-sheet"
      role="dialog"
      aria-label={title}
    >
      <div
        className="mx-auto mb-3 mt-1 h-1 w-10 cursor-pointer rounded-full bg-gray-300"
        onClick={onClose}
      />

      <div className="flex gap-3.5">
        {loading ? (
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-gray-200" />
        ) : thumb ? (
          <img
            className="h-24 w-24 shrink-0 rounded-2xl bg-gray-100 object-cover"
            src={thumb}
            alt={title}
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
            🗺️
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="my-0.5 text-lg font-bold">{title}</h2>
            {visited && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                방문 완료
              </span>
            )}
          </div>
          {inBucket && !visited && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
              내 저장 목록
            </span>
          )}

          {loading ? (
            <>
              <div className="my-2 h-3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-gray-200" />
            </>
          ) : (
            <>
              {addr && <p className="my-1 text-[13px] text-muted-foreground">📍 {addr}</p>}
              {useTime && <p className="my-1 text-[13px] text-muted-foreground">🕒 {useTime}</p>}
            </>
          )}
        </div>
      </div>

      {!loading && overview && (
        <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-gray-700">{overview}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-bold text-white disabled:opacity-55"
          onClick={onFindRoute}
          disabled={routing}
        >
          {routing ? '경로 탐색…' : '🧭 길찾기'}
        </button>
        <button
          type="button"
          className={cn(
            'flex-1 rounded-xl py-3 text-[13px] font-bold disabled:opacity-55',
            saveBtnClass,
          )}
          onClick={onSave}
        >
          {saveLabel}
        </button>
        {onCheckoff && (
          <button
            type="button"
            className={cn(
              'flex-1 rounded-xl py-3 text-[13px] font-bold text-white disabled:opacity-55',
              visited ? 'bg-success' : 'bg-primary',
            )}
            onClick={onCheckoff}
            disabled={visited}
          >
            {visited ? '✓ 방문 완료' : '✓ 방문 인증'}
          </button>
        )}
      </div>

      {/* 서브 액션: 카카오 내비앱 열기 (모바일=내비앱 딥링크 → 미설치 시 카카오맵 웹, 데스크톱=웹 새창) */}
      {onOpenKakaoNavi && (
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-primary py-2.5 text-[13px] font-bold text-primary"
          onClick={onOpenKakaoNavi}
        >
          🚗 카카오 내비앱에서 경로 안내
        </button>
      )}
    </div>
  );
}
