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

// ── 버킷리스트 (팀 /api/v1/bucket-lists 스펙) ──
// ⚠ 인증 필수: 컨트롤러가 @LoginUser 를 쓰므로 JWT 없으면 401. 호출부에서 catch 하여 로컬 상태만 유지한다.
// ⚠ 서버 스키마에 contentId/contentTypeId 자리가 없다. 지도는 TourAPI contentId 로 장소를 식별하므로
//   저장 시 프론트가 bucketListId ↔ contentId 매핑을 savedPlacesStore 에 들고 간다.
//   (서버에서 새로 받은 항목은 contentId 를 복원할 수 없어 상세 시트를 열 수 없다 — 백엔드 필드 추가 요청 중)

/** 서버 버킷 행 → 지도 마커용 Place. contentId 가 없으므로 id 는 로컬 매핑으로 보강해야 한다. */
function toBucketPlace(b) {
  return {
    bucketListId: b.bucketListId,
    id: b.bucketListId, // contentId 미보유 시 임시 식별자 (호출부에서 로컬 매핑으로 덮어씀)
    contentTypeId: null,
    title: b.title,
    lat: b.latitude != null ? Number(b.latitude) : null,
    lng: b.longitude != null ? Number(b.longitude) : null,
    thumbnail: b.imageUrl ?? null,
    addr: b.address ?? b.placeName ?? null,
    dist: null,
    category: b.category,
    inBucket: true,
    isVisited: b.isCompleted === true,
  };
}

/** 목록 조회. 응답이 PageResponse 이므로 content 를 꺼낸다. completed 로 방문 여부 필터. */
export const fetchBuckets = (completed, page = 0, size = 100) =>
  client
    .get('/api/v1/bucket-lists', {
      params: { category: 'ALL', size, page, ...(completed != null ? { completed } : {}) },
    })
    .then(unwrap)
    .then((res) => (res?.content ?? []).map(toBucketPlace));

/** 방문 완료 목록 = completed=true 필터 (구 /bucket/visits 대체). */
export const fetchVisits = () => fetchBuckets(true);

/** 저장. category 는 @NotBlank 라 반드시 채워야 한다 (K_POP/K_BEAUTY/K_DRAMA/K_FOOD). */
export const createBucket = (body) => client.post('/api/v1/bucket-lists', body).then(unwrap);

export const deleteBucket = (bucketListId) =>
  client.delete(`/api/v1/bucket-lists/${bucketListId}`).then(unwrap);

/** 방문 인증 = completion PATCH (구 /bucket/checkin 대체). 서버에 거리 검증은 없어 프론트 haversine 이 담당. */
export const setBucketCompletion = (bucketListId, isCompleted = true) =>
  client.patch(`/api/v1/bucket-lists/${bucketListId}/completion`, { isCompleted }).then(unwrap);

// 변경
export const requestDirections = (body) =>
  client.post('/api/v1/route/directions', body).then(unwrap);
