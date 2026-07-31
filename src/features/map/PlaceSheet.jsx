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
export function PlaceSheet({
  place,
  detail,
  loading,
  saved,
  visited,
  routing,
  onClose,
  onFindRoute,
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
                방문완료
              </span>
            )}
          </div>
          {inBucket && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
              On your bucket list
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
          {routing ? '경로 탐색…' : '🧭 Find Route'}
        </button>
        <button
          type="button"
          className={cn(
            'flex-1 rounded-xl py-3 text-[13px] font-bold text-white disabled:opacity-55',
            saved ? 'bg-success' : 'bg-primary',
          )}
          onClick={onSave}
          disabled={saved}
        >
          {saved ? '✓ Saved' : '🔖 Save'}
        </button>
        <button
          type="button"
          className={cn(
            'flex-1 rounded-xl py-3 text-[13px] font-bold text-white disabled:opacity-55',
            visited ? 'bg-success' : 'bg-primary',
          )}
          onClick={onCheckoff}
          disabled={visited}
        >
          {visited ? '✓ Visited' : '📌 Check off'}
        </button>
      </div>
    </div>
  );
}
