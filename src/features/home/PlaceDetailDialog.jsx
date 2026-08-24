import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { EmptyState } from '@/shared/components/EmptyState';
import { usePlaceDetailQuery } from './homeApi';

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

// 이용시간/휴무일은 <br> 로 여러 줄이 이어져 오는데, 그대로 한 줄로 합치면
// 줄 구분용으로 붙어있던 "-" 가 문장 중간에 낀 것처럼 지저분해 보인다.
// <br> 기준으로 줄을 나누고, 각 줄 앞의 불필요한 "-" 를 제거해 리스트로 보여준다.
function cleanTimeLines(s) {
  if (!s) return [];
  return s
    .split(/<br\s*\/?>/gi)
    .map((line) =>
      line
        .replace(/<[^>]+>/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .replace(/^-+\s*/, ''),
    )
    .filter(Boolean);
}

// 첫 문장(마침표 기준)만 잘라내고 나머지는 "자세히 보기"로 감춘다.
function splitFirstSentence(text) {
  if (!text) return { first: null, rest: null };
  const idx = text.indexOf('. ');
  if (idx === -1) return { first: text, rest: null };
  return { first: text.slice(0, idx + 1), rest: text.slice(idx + 2) };
}

export function PlaceDetailDialog({ place, open, onOpenChange }) {
  const { data, isLoading, isError } = usePlaceDetailQuery(place?.id, place?.contentTypeId);
  const [expanded, setExpanded] = useState(false);

  const title = data?.title ?? place?.title;
  const thumbnail = data?.thumbnail ?? place?.thumbnail;
  const addr = data?.addr ?? place?.addr;
  const overview = cleanHtml(data?.overview);
  const useTimeLines = cleanTimeLines(data?.useTime);
  const restDateLines = cleanTimeLines(data?.restDate);
  const { first: overviewFirst, rest: overviewRest } = splitFirstSentence(overview);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85dvh] w-full gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-md"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {isLoading && (
          <div className="p-6">
            <Spinner />
          </div>
        )}
        {!isLoading && isError && (
          <div className="p-6">
            <ErrorMessage message="상세 정보를 불러올 수 없어요." />
          </div>
        )}
        {!isLoading && !isError && !data && (
          <div className="p-6">
            <EmptyState message="상세 정보가 없어요." />
          </div>
        )}
        {!isLoading && !isError && data && (
          <>
            <div className="relative h-52 w-full shrink-0 overflow-hidden bg-primary-soft">
              {thumbnail ? (
                <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">🗺️</div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
              <h2 className="absolute inset-x-5 bottom-4 line-clamp-2 text-lg font-extrabold leading-snug text-white">
                {title}
              </h2>
              <DialogClose className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60">
                <X className="size-4" />
                <span className="sr-only">닫기</span>
              </DialogClose>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {(addr || useTimeLines.length > 0 || restDateLines.length > 0) && (
                <div className="flex flex-col gap-2">
                  {addr && (
                    <p className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <span className="shrink-0">📍</span>
                      <span>{addr}</span>
                    </p>
                  )}
                  {useTimeLines.length > 0 && (
                    <div className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <span className="shrink-0">🕒</span>
                      <div className="flex flex-col gap-0.5">
                        {useTimeLines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {restDateLines.length > 0 && (
                    <div className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <span className="shrink-0">🚫</span>
                      <div className="flex flex-col gap-0.5">
                        {restDateLines.map((line, i) => (
                          <span key={line}>{i === 0 ? `휴무일 ${line}` : line}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {overviewFirst && (
                <div className="text-[14px] leading-[1.7] text-foreground/85">
                  <p className="whitespace-pre-line">{expanded ? overview : overviewFirst}</p>
                  {overviewRest && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-1 text-[13px] font-bold text-primary"
                    >
                      {expanded ? '접기' : '자세히 보기'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
