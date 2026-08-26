// 저장한 장소 · 방문 완료 상태를 localStorage 로 관리하는 공유 스토어.
// 지도(feature/map)와 마이페이지(feature/profile)가 둘 다 소비하므로 shared 위치.
//
// 서버(/api/v1/bucket-lists)가 정본이지만 두 가지 이유로 이 스토어를 계속 유지한다.
//  1. 비로그인 상태에서도 저장 UI 가 동작해야 한다 (bucket-lists 는 JWT 필수 → 401).
//  2. 서버 스키마에 TourAPI contentId 자리가 없어, bucketListId ↔ contentId 매핑을 여기서 들고 간다.
//     이 매핑이 없으면 저장한 장소의 상세 시트를 다시 열 수 없다.

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

/** 서버 저장 성공 후 bucketListId 를 붙인다. 삭제/방문인증이 이 id 를 필요로 한다. */
export function attachBucketListId(id, bucketListId) {
  const next = getSavedPlaces().map((p) => (p.id === id ? { ...p, bucketListId } : p));
  setSavedPlaces(next);
  return next;
}

/** contentId 로 서버 bucketListId 조회. 없으면 null (비로그인 저장분 등). */
export function getBucketListId(id) {
  return getSavedPlaces().find((p) => p.id === id)?.bucketListId ?? null;
}

/**
 * 서버 목록과 로컬 저장분을 합친다.
 * 서버 항목은 contentId 를 복원할 수 없으므로, 좌표·제목이 일치하는 로컬 항목이 있으면
 * 그 contentId(=id)와 contentTypeId 를 살려 상세 시트를 열 수 있게 한다.
 */
export function mergeServerBuckets(serverList) {
  const local = getSavedPlaces();
  const sameSpot = (a, b) =>
    a.title === b.title &&
    a.lat != null &&
    b.lat != null &&
    Math.abs(a.lat - b.lat) < 1e-6 &&
    Math.abs(a.lng - b.lng) < 1e-6;

  return serverList.map((s) => {
    const hit =
      local.find((l) => l.bucketListId === s.bucketListId) ?? local.find((l) => sameSpot(l, s));
    return hit ? { ...s, id: hit.id, contentTypeId: hit.contentTypeId ?? null } : s;
  });
}
