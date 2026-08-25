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
