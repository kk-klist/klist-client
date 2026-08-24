import { client } from '@/shared/api/client';

// ── 지도 백엔드 API 호출 (팀 컨벤션: /api/v1/{domain}, 응답 ApiResponse{success,data}) ──
// client 인터셉터가 axios 응답을 그대로 반환하므로 .data 를 꺼낸다.
// 백엔드 응답은 서버측 도메인 필드명(camelCase 원본: latitude/longitude/imageUrl/address/distance) 을 쓴다.
// 프론트 지도(useMapPage/pins)는 짧은 별칭(lat/lng/thumbnail/addr/dist) 을 쓰므로 여기서 매핑한다.
// ⚠ 지도 예외: 카카오 SDK 이벤트(idle 등)와 얽혀 명령형으로 동작하므로,
//   TanStack Query 훅 대신 함수 직접 호출을 허용한다 (CLAUDE.md 규칙의 지도 예외).

// client 인터셉터가 이미 axios 응답 → body 로 벗겨줌. body 는 {success, data} 이므로 .data 만 한 번 더 꺼낸다.
const unwrap = (res) => res?.data;

/** TourSpot / Festival — id = contentId (문자열) */
function toTourPlace(t) {
  return {
    id: t.contentId,
    contentTypeId: t.contentTypeId ?? null,
    title: t.title,
    lat: t.latitude,
    lng: t.longitude,
    thumbnail: t.imageUrl,
    addr: t.address,
    dist: t.distance ?? null,
  };
}

/** Kakao Local POI — id = kakao document id (문자열), contentTypeId 없음 */
function toPoiPlace(p) {
  return {
    id: p.id,
    contentTypeId: null,
    title: p.placeName,
    lat: p.latitude,
    lng: p.longitude,
    thumbnail: null,
    addr: p.address,
    dist: p.distance ?? null,
  };
}

/** Recommend — 백엔드 S5 가 TourAPI 기반이라 contentId + title 사용 (TourSpot 과 사실상 동일 스펙 + genre) */
function toRecommendPlace(r) {
  return {
    id: r.contentId,
    contentTypeId: r.contentTypeId ?? null,
    title: r.title,
    lat: r.latitude,
    lng: r.longitude,
    thumbnail: r.imageUrl,
    addr: r.address,
    dist: r.distanceMeters ?? null,
    genre: r.genre,
  };
}

/** TourDetail — 상세 시트용 (images/overview/useTime 포함) */
function toTourDetail(d) {
  return {
    id: d.contentId,
    contentTypeId: d.contentTypeId,
    title: d.title,
    lat: d.latitude,
    lng: d.longitude,
    thumbnail: d.imageUrl,
    addr: d.address,
    overview: d.overview,
    useTime: d.useTime,
    images: d.images,
  };
}

// 조회 (fetchXxx)
// ⚠ /api/v1/tour/nearby 응답이 배열 ↔ PageResponse{content,...} 사이를 오가서
// 어느 쪽으로 와도 배열을 뽑아내도록 방어적으로 파싱한다.
export const fetchNearby = (lat, lng, radius, category, lang = 'ko') =>
  client
    .get('/api/v1/tour/nearby', { params: { lat, lng, radius, category, lang } })
    .then(unwrap)
    .then((res) => (Array.isArray(res) ? res : (res?.content ?? [])).map(toTourPlace));

export const fetchPlacesByKeyword = (keyword, lang = 'ko') =>
  client
    .get('/api/v1/tour/search', { params: { keyword, lang } })
    .then(unwrap)
    .then((list) => (list ?? []).map(toTourPlace));

export const fetchFestivals = (areaCode, lang = 'ko') =>
  client
    .get('/api/v1/tour/festival', { params: { areaCode, lang } })
    .then(unwrap)
    .then((list) => (list ?? []).map(toTourPlace));

export const fetchPlaceDetail = (contentId, contentTypeId, lang = 'ko') =>
  client
    .get(`/api/v1/tour/detail/${encodeURIComponent(contentId)}`, {
      params: { contentTypeId, lang },
    })
    .then(unwrap)
    .then((d) => (d ? toTourDetail(d) : null));

export const fetchPoiByCategory = (code, lat, lng, radius) =>
  client
    .get('/api/v1/poi/category', { params: { code, lat, lng, radius } })
    .then(unwrap)
    .then((list) => (list ?? []).map(toPoiPlace));

export const fetchRecommend = (genre, lat, lng, radius) =>
  client
    .get('/api/v1/recommend', { params: { genre, lat, lng, radius } })
    .then(unwrap)
    .then((list) => (list ?? []).map(toRecommendPlace));

// 버킷/체크인 — 팀 bucket-lists 담당의 GET/DELETE/checkin 준비 전까지는 실패 허용 (호출부에서 catch)
// 준비되면 이슈 #12 에서 팀 스펙(/bucket-lists)으로 재작성 예정
export const fetchBuckets = (completed) =>
  client
    .get('/api/v1/bucket', { params: completed != null ? { completed } : {} })
    .then(unwrap)
    .then((list) => list ?? []);

export const fetchVisits = () =>
  client
    .get('/api/v1/bucket/visits')
    .then(unwrap)
    .then((list) => list ?? []);

// 변경
export const requestDirections = (body) =>
  client.post('/api/v1/route/directions', body).then(unwrap);

export const createBucket = (body) => client.post('/api/v1/bucket', body).then(unwrap);

export const deleteBucket = (bucketId) => client.delete(`/api/v1/bucket/${bucketId}`).then(unwrap);

export const checkin = (body) => client.post('/api/v1/bucket/checkin', body).then(unwrap);
