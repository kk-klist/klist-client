import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { client } from '@/shared/api/client';
import { getCurrentPosition } from '@/shared/utils/geo';

const NEARBY_RADIUS_METERS = 3000;
const PAGE_SIZE = 10;
const INITIAL_PAGE_PARAM = { tourPage: null, recommendAll: null, recommendOffset: 0 };

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

// ⚠ /api/v1/tour/nearby 는 PageResponse{content,hasNext,totalPages,totalElements} 로 응답한다 (page 1부터 시작).
const fetchNearbyTourPage = (lat, lng, page, radius = NEARBY_RADIUS_METERS, size = PAGE_SIZE) =>
  client
    .get('/api/v1/tour/nearby', { params: { lat, lng, radius, page, size } })
    .then(unwrap)
    .then((res) => ({
      items: (res?.content ?? []).map(toTourPlace),
      hasNext: res?.hasNext ?? false,
    }));

// recommend 는 백엔드에 page/size 파라미터가 없어 한 번에 전체를 반환한다.
// 그대로 다 보여주면 "한꺼번에 다 로드되는" 느낌이 나므로, 받아온 전체 배열을
// pageParam(recommendAll/recommendOffset)에 담아 클라이언트에서 PAGE_SIZE 단위로 잘라서 보여준다.
function sliceRecommend(recommendAll, offset) {
  const items = recommendAll.slice(offset, offset + PAGE_SIZE);
  const nextOffset = offset + PAGE_SIZE;
  return {
    items,
    nextPageParam:
      nextOffset < recommendAll.length ? { recommendAll, recommendOffset: nextOffset } : null,
  };
}

async function fetchNearbyPage(lat, lng, pageParam) {
  if (pageParam.recommendAll) {
    return sliceRecommend(pageParam.recommendAll, pageParam.recommendOffset);
  }

  if (pageParam.tourPage == null) {
    // 최초 페이지: K-컬처 큐레이션(recommend)을 우선 시도한다.
    const recommended = await fetchRecommend(lat, lng);
    if (recommended.length > 0) {
      return sliceRecommend(recommended, 0);
    }
    // 큐레이션 반경 밖(지방 등)이면 이후부터 tour/nearby 서버 페이지네이션으로 전환
    const { items, hasNext } = await fetchNearbyTourPage(lat, lng, 1);
    return { items, nextPageParam: hasNext ? { tourPage: 2 } : null };
  }

  const { items, hasNext } = await fetchNearbyTourPage(lat, lng, pageParam.tourPage);
  return { items, nextPageParam: hasNext ? { tourPage: pageParam.tourPage + 1 } : null };
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
