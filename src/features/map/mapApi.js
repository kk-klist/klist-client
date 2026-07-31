import { client } from '@/shared/api/client';

// ── 지도 백엔드 API 호출 함수 (팀 컨벤션: /api/v1/{domain}, 응답 ApiResponse{success,data}) ──
// client 인터셉터는 axios 바디({success,data})를 그대로 반환하므로 여기서 .data 를 꺼낸다.
// ⚠ 지도 예외: 카카오 SDK 이벤트(idle 등)와 얽혀 명령형으로 동작하므로,
//   TanStack Query 훅 대신 함수 직접 호출을 허용한다 (CLAUDE.md 규칙의 지도 예외).
const unwrap = (res) => res?.data;

// 조회 (fetchXxx)
export const fetchNearby = (lat, lng, radius, category, lang = 'ko') =>
  client.get('/api/v1/tour/nearby', { params: { lat, lng, radius, category, lang } }).then(unwrap);

export const fetchPlacesByKeyword = (keyword, lang = 'ko') =>
  client.get('/api/v1/tour/search', { params: { keyword, lang } }).then(unwrap);

export const fetchFestivals = (areaCode, lang = 'ko') =>
  client.get('/api/v1/tour/festival', { params: { areaCode, lang } }).then(unwrap);

export const fetchPlaceDetail = (contentId, contentTypeId, lang = 'ko') =>
  client
    .get(`/api/v1/tour/detail/${encodeURIComponent(contentId)}`, {
      params: { contentTypeId, lang },
    })
    .then(unwrap);

export const fetchPoiByCategory = (code, lat, lng, radius) =>
  client.get('/api/v1/poi/category', { params: { code, lat, lng, radius } }).then(unwrap);

export const fetchRecommend = (genre, lat, lng, radius) =>
  client.get('/api/v1/recommend', { params: { genre, lat, lng, radius } }).then(unwrap);

export const fetchBuckets = (completed) =>
  client.get('/api/v1/bucket', { params: completed != null ? { completed } : {} }).then(unwrap);

export const fetchVisits = () => client.get('/api/v1/bucket/visits').then(unwrap);

// 변경
export const requestDirections = (body) =>
  client.post('/api/v1/route/directions', body).then(unwrap);

export const createBucket = (body) => client.post('/api/v1/bucket', body).then(unwrap);

export const deleteBucket = (bucketId) => client.delete(`/api/v1/bucket/${bucketId}`).then(unwrap);

export const checkin = (body) => client.post('/api/v1/bucket/checkin', body).then(unwrap);
