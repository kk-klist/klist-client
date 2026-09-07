import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { client } from '@/shared/api/client';
import { getCurrentPosition } from '@/shared/utils/geo';

const NEARBY_RADIUS_METERS = 3000;
const PAGE_SIZE = 10;
const INITIAL_PAGE_PARAM = { all: null, offset: 0 };

const unwrap = (res) => res?.data;

/** Recommend — 백엔드 TourAPI 기반, contentId + genre + 거리(distanceMeters) 포함 */
function toRecommendPlace(r) {
  return {
    id: r.contentId,
    contentTypeId: r.contentTypeId ?? null,
    genre: r.genre,
    title: r.title,
    lat: r.latitude,
    lng: r.longitude,
    thumbnail: r.imageUrl,
    addr: r.address,
    dist: r.distanceMeters ?? null,
  };
}

/** TourSpot — K-컬처 큐레이션 반경 밖(지방 등)일 때 장르 무관 일반 근처 검색 폴백용 */
function toTourPlace(t) {
  return {
    id: t.contentId,
    contentTypeId: t.contentTypeId ?? null,
    genre: null,
    title: t.title,
    lat: t.latitude,
    lng: t.longitude,
    thumbnail: t.imageUrl,
    addr: t.address,
    dist: t.distance ?? null,
  };
}

const fetchRecommend = (lat, lng, radius = NEARBY_RADIUS_METERS) =>
  client
    .get('/api/v1/recommend', { params: { lat, lng, radius } })
    .then(unwrap)
    .then((list) => (list ?? []).map(toRecommendPlace));

// ⚠ /api/v1/tour/nearby 응답 모양이 배열 ↔ PageResponse{content,...} 사이를 계속 오가서,
// 어느 쪽으로 와도 배열을 뽑아내도록 방어적으로 파싱한다. page/size 는 서버가 무시할 수 있어
// 신뢰하지 않고, 받은 걸 통째로 client 에서 PAGE_SIZE 단위로 잘라서 보여준다.
const fetchNearbyTourAll = (lat, lng, radius = NEARBY_RADIUS_METERS) =>
  client
    .get('/api/v1/tour/nearby', { params: { lat, lng, radius } })
    .then(unwrap)
    .then((res) => (Array.isArray(res) ? res : (res?.content ?? [])).map(toTourPlace));

/** TourDetail — 상세 다이얼로그용 (images/overview/useTime/restDate 포함) */
function toPlaceDetail(d) {
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
    restDate: d.restDate,
    images: d.images ?? [],
  };
}

const fetchPlaceDetail = (contentId, contentTypeId, lang = 'ko') =>
  client
    .get(`/api/v1/tour/detail/${encodeURIComponent(contentId)}`, {
      params: { contentTypeId, lang },
    })
    .then(unwrap)
    .then((d) => (d ? toPlaceDetail(d) : null));

export function usePlaceDetailQuery(contentId, contentTypeId) {
  return useQuery({
    queryKey: ['placeDetail', contentId, contentTypeId],
    queryFn: () => fetchPlaceDetail(contentId, contentTypeId),
    enabled: !!contentId,
  });
}

/** BucketListProgress — totalCount/completedCount/progressRate(%) */
function toBucketProgress(p) {
  return {
    totalCount: p.totalCount,
    completedCount: p.completedCount,
    progressRate: Number(p.progressRate),
  };
}

const fetchBucketProgress = () =>
  client.get('/api/v1/bucket-lists/progress').then(unwrap).then(toBucketProgress);

export function useBucketProgressQuery(options) {
  return useQuery({
    queryKey: ['home', 'bucketProgress'],
    queryFn: fetchBucketProgress,
    ...options,
  });
}

/** BucketListPreview — 홈 화면 미리보기용 최신 등록 순 상위 N건 */
const BUCKET_PREVIEW_SIZE = 3;

function toBucketListPreviewItem(b) {
  return {
    id: b.bucketListId,
    title: b.title,
    category: b.category,
    isCompleted: b.isCompleted === true,
    imageUrl: b.imageUrl ?? null,
    placeName: b.placeName ?? b.address ?? null,
  };
}

const fetchBucketListPreview = () =>
  client
    .get('/api/v1/bucket-lists', {
      params: { category: 'ALL', page: 0, size: BUCKET_PREVIEW_SIZE },
    })
    .then(unwrap)
    .then((page) => (page?.content ?? []).map(toBucketListPreviewItem));

export function useBucketListPreviewQuery(options) {
  return useQuery({
    queryKey: ['home', 'bucketListPreview'],
    queryFn: fetchBucketListPreview,
    ...options,
  });
}

/**
 * NearbyCheckin — 미완료 버킷리스트 중 현재 위치에서 가장 가까운 항목.
 * 실제 방문 인증(거리 검증 + completion PATCH)은 지도 화면이 담당하므로,
 * 여기서는 "근처에 인증 가능한 장소가 있는지"만 판단해 지도로 안내한다.
 */
const NEARBY_CHECKIN_RADIUS_METERS = 500;

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toCheckinCandidate(b) {
  return {
    bucketListId: b.bucketListId,
    title: b.title,
    placeName: b.placeName ?? b.address ?? null,
    lat: b.latitude != null ? Number(b.latitude) : null,
    lng: b.longitude != null ? Number(b.longitude) : null,
  };
}

const fetchIncompleteBucketLists = () =>
  client
    .get('/api/v1/bucket-lists', {
      params: { category: 'ALL', completed: false, page: 0, size: 100 },
    })
    .then(unwrap)
    .then((page) => (page?.content ?? []).map(toCheckinCandidate));

export function useNearbyCheckinQuery(options) {
  const geoQuery = useQuery({
    queryKey: ['geo', 'current'],
    queryFn: getCurrentPosition,
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
  const coords = geoQuery.data;

  const bucketsQuery = useQuery({
    queryKey: ['home', 'nearbyCheckinCandidates'],
    queryFn: fetchIncompleteBucketLists,
    enabled: options?.enabled !== false && !!coords,
  });

  let candidate = null;
  if (coords && bucketsQuery.data) {
    let nearestDistance = Infinity;
    for (const b of bucketsQuery.data) {
      if (b.lat == null || b.lng == null) continue;
      const distance = haversineMeters(coords.lat, coords.lng, b.lat, b.lng);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        candidate = { ...b, distanceMeters: distance };
      }
    }
    if (candidate && nearestDistance > NEARBY_CHECKIN_RADIUS_METERS) candidate = null;
  }

  return {
    candidate,
    isLoading: geoQuery.isPending || (!!coords && bucketsQuery.isPending),
    isError: geoQuery.isError || bucketsQuery.isError,
  };
}

// recommend/tour 둘 다 백엔드가 페이지네이션을 보장해주지 않아 한 번에 전체를 받아오는 경우가 있다.
// 그대로 다 보여주면 "한꺼번에 다 로드되는" 느낌이 나므로, 받아온 전체 배열을
// pageParam(all/offset)에 담아 클라이언트에서 PAGE_SIZE 단위로 잘라서 보여준다.
function sliceAll(all, offset) {
  const items = all.slice(offset, offset + PAGE_SIZE);
  const nextOffset = offset + PAGE_SIZE;
  return {
    items,
    nextPageParam: nextOffset < all.length ? { all, offset: nextOffset } : null,
  };
}

async function fetchNearbyPage(lat, lng, pageParam) {
  if (pageParam.all) {
    return sliceAll(pageParam.all, pageParam.offset);
  }

  // 최초 페이지: K-컬처 큐레이션(recommend)을 우선 시도한다.
  const recommended = await fetchRecommend(lat, lng);
  if (recommended.length > 0) {
    return sliceAll(recommended, 0);
  }
  // 큐레이션 반경 밖(지방 등)이면 장르 무관 일반 근처 검색으로 대체
  const tourAll = await fetchNearbyTourAll(lat, lng);
  return sliceAll(tourAll, 0);
}

export function useNearbyRecommendQuery() {
  const geoQuery = useQuery({
    queryKey: ['geo', 'current'],
    queryFn: getCurrentPosition,
    staleTime: 5 * 60 * 1000,
    retry: false, // 위치 권한 거부/실패는 재시도해도 똑같이 실패한다
  });
  const coords = geoQuery.data;

  const query = useInfiniteQuery({
    queryKey: ['recommend', 'nearby', coords?.lat, coords?.lng],
    queryFn: ({ pageParam }) => fetchNearbyPage(coords.lat, coords.lng, pageParam),
    initialPageParam: INITIAL_PAGE_PARAM,
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    enabled: !!coords,
  });

  return {
    places: query.data?.pages.flatMap((p) => p.items) ?? [],
    // coords 가 없는 동안은 geoQuery 가 아직 진행 중일 때만 로딩 — geoQuery 가 실패했으면(isError) 무한 로딩 대신 에러로 빠진다.
    isLoading: geoQuery.isPending || (!!coords && query.isPending),
    isError: geoQuery.isError || query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
