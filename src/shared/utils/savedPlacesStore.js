// 저장한 장소 · 방문 완료 상태를 localStorage 로 관리하는 공유 스토어.
// 지도(feature/map)와 마이페이지(feature/profile)가 둘 다 소비하므로 shared 위치.
// 팀 백엔드 bucket-lists 조회/체크인 API 붙기 전까지의 임시 저장소 — API 붙으면 이 파일의
// getSavedPlaces / setSavedPlaces 내부만 서버 호출로 교체하면 소비자 코드는 그대로 유지된다.

export const SAVED_PLACES_KEY = 'klist:savedPlaces';

/** 저장 목록 전체를 읽어온다. 파싱 실패나 미존재 시 빈 배열. */
export function getSavedPlaces() {
  try {
    const raw = localStorage.getItem(SAVED_PLACES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 방문 완료 항목만 (마이페이지 뱃지·리스트용). */
export function getVisitedPlaces() {
  return getSavedPlaces().filter((p) => p.isVisited === true);
}

/** 특정 장소가 이미 저장되어 있는지. */
export function isSaved(id) {
  return getSavedPlaces().some((p) => p.id === id);
}

/** 저장 목록 전체를 덮어쓴다. quota 초과 등은 무시. */
export function setSavedPlaces(list) {
  try {
    localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(list));
  } catch {
    /* quota 초과 등 무시 */
  }
}

/** 신규 저장 (이미 있으면 no-op). isVisited 기본 false. */
export function addSaved(place) {
  const list = getSavedPlaces();
  if (list.some((p) => p.id === place.id)) return list;
  const next = [...list, { ...place, isVisited: place.isVisited ?? false }];
  setSavedPlaces(next);
  return next;
}

/** 저장 취소. */
export function removeSaved(id) {
  const next = getSavedPlaces().filter((p) => p.id !== id);
  setSavedPlaces(next);
  return next;
}

/** 방문 인증 완료 마킹. 저장 목록에 없으면 no-op. */
export function markVisited(id) {
  const next = getSavedPlaces().map((p) => (p.id === id ? { ...p, isVisited: true } : p));
  setSavedPlaces(next);
  return next;
}
