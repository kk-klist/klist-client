import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from '@/shared/utils/toast';
import { useKakaoLoader, getKakao } from './useKakaoLoader';
import * as mapApi from './mapApi';
import { DEFAULT_CENTER, QUICK_PLACES, radiusForLevel, getCurrentPosition, GEO_ERROR } from './geo';
import { PURPLE_PIN, TEAL_PIN, MY_DOT } from './pins';
import { CATEGORIES } from './mapConstants';

// TourAPI 가 지원하는 언어 화이트리스트. 미매칭 시 기본 'ko'.
// 지금은 지도 페이지 URL query param(?lang=en)으로만 관리한다.
// 추후 마이페이지 Language 설정 or 온보딩 언어 선택이 붙으면 전역 store 로 승격 예정 (기준문서 참고).
const SUPPORTED_LANGS = new Set(['ko', 'en', 'ja', 'zh-CN', 'zh-TW']);
function resolveLang(search) {
  const raw = new URLSearchParams(search).get('lang');
  return raw && SUPPORTED_LANGS.has(raw) ? raw : 'ko';
}

// 백엔드 버킷 행 → 지도 마커용 Place
function bucketToPlace(b) {
  return {
    id: b.contentId,
    contentTypeId: b.contentTypeId,
    title: b.title,
    lat: b.lat,
    lng: b.lng,
    thumbnail: b.thumbnail,
    addr: b.addr,
    dist: null,
    inBucket: true,
    visited: b.isCompleted,
  };
}

// 지도 페이지 유스케이스 전체(마커/검색/추천/저장/인증)를 담당하는 훅.
// ⚠ 카카오 SDK 는 imperative 라 서버 호출을 Query 훅 대신 mapApi 함수로 직접 한다 (기준문서 '지도 예외').
export function useMapPage() {
  const ready = useKakaoLoader();
  const location = useLocation();
  const lang = useMemo(() => resolveLang(location.search), [location.search]);
  const langRef = useRef(lang);

  const mapDivRef = useRef(null);
  // ref 를 반환하면 린트(react-hooks/refs)가 훅 반환값 전체를 ref 로 간주하므로,
  // 지도 컨테이너는 콜백 ref 로 노출한다.
  const registerMapEl = useCallback((el) => {
    mapDivRef.current = el;
  }, []);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const routeLineRef = useRef(null);
  const myDotRef = useRef(null);
  const idleTimer = useRef(undefined);
  const activeRef = useRef('nearby');
  const genreRef = useRef(null);
  const visitedRef = useRef([]);

  const [active, setActive] = useState('nearby');
  const [genre, setGenre] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [routing, setRouting] = useState(false);
  const [visited, setVisited] = useState([]);
  const [saved, setSaved] = useState([]);
  const [myLoc, setMyLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  // 카카오 JS 키 미설정 여부는 env 에서 바로 계산 (effect 내 setState 회피)
  const key = import.meta.env.VITE_KAKAO_JS_KEY;
  const noKey = !key || key.startsWith('여기에');

  // ---- 최초 1회: 백엔드에서 저장/방문 상태 로드 ----
  useEffect(() => {
    (async () => {
      try {
        const [buckets, visits] = await Promise.all([mapApi.fetchBuckets(), mapApi.fetchVisits()]);
        setSaved(buckets.map((b) => b.contentId));
        const v = Array.from(
          new Set([
            ...buckets.filter((b) => b.isCompleted).map((b) => b.contentId),
            ...visits.map((x) => x.contentId),
          ]),
        );
        visitedRef.current = v;
        setVisited(v);
      } catch {
        /* 백엔드 미기동 시 조용히 스킵 — 지도는 동작 */
      }
    })();
  }, []);

  // 하이드레이션이 초기 렌더보다 늦게 끝나도 방문 색이 반영되게 재렌더
  useEffect(() => {
    if (places.length > 0) renderMarkers(places);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited]);

  // URL ?lang= 변경 시 langRef 갱신 + 현재 카테고리 재조회 (지도가 이미 뜬 뒤에만)
  useEffect(() => {
    langRef.current = lang;
    if (mapRef.current) loadForView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ---- 마커 렌더 (이전 마커 전부 제거 후 새로 그림) ----
  function renderMarkers(list) {
    const kakao = getKakao();
    const cl = clustererRef.current;
    if (!cl) return;
    cl.clear();
    const markers = list
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => {
        const isVisited = p.visited || visitedRef.current.includes(p.id);
        const image = new kakao.maps.MarkerImage(
          isVisited ? TEAL_PIN : PURPLE_PIN,
          new kakao.maps.Size(30, 40),
          { offset: new kakao.maps.Point(15, 40) },
        );
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(p.lat, p.lng),
          image,
          title: p.title,
        });
        kakao.maps.event.addListener(marker, 'click', () => selectPlace(p));
        return marker;
      });
    cl.addMarkers(markers);
  }

  // ---- 마커 클릭 → 상세 시트 ----
  async function selectPlace(p) {
    setSelected(p);
    setDetail(null);
    if (mapRef.current && p.lat != null && p.lng != null) {
      mapRef.current.panTo(new (getKakao().maps.LatLng)(p.lat, p.lng));
    }
    if (!/^\d+$/.test(p.id)) return; // 카카오 POI/spot-N 은 TourAPI 상세 없음
    setDetailLoading(true);
    try {
      setDetail(await mapApi.fetchPlaceDetail(p.id, p.contentTypeId ?? undefined, langRef.current));
    } catch {
      /* 상세 실패 시 기본 정보 유지 */
    } finally {
      setDetailLoading(false);
    }
  }

  // ---- 현재 지도 영역 기준 재조회 ----
  async function loadForView() {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    const lat = c.getLat();
    const lng = c.getLng();
    const radius = radiusForLevel(map.getLevel());
    const cat = CATEGORIES.find((x) => x.key === activeRef.current);
    setLoading(true);
    try {
      let result = [];
      const currentLang = langRef.current;
      if (cat.source === 'mylist') result = (await mapApi.fetchBuckets()).map(bucketToPlace);
      else if (cat.source === 'recommend')
        result = await mapApi.fetchRecommend(genreRef.current ?? undefined, lat, lng);
      else if (cat.source === 'nearby')
        result = await mapApi.fetchNearby(lat, lng, radius, undefined, currentLang);
      else if (cat.source === 'kakao')
        result = await mapApi.fetchPoiByCategory(cat.key, lat, lng, radius);
      else if (cat.source === 'festival')
        result = await mapApi.fetchFestivals(undefined, currentLang);
      setPlaces(result);
      renderMarkers(result);
      if (result.length === 0 && cat.source !== 'mylist') toast('검색 결과 없음');
    } catch {
      toast.error('데이터를 불러오지 못했어요 (백엔드/키 확인)');
    } finally {
      setLoading(false);
    }
  }

  // ---- 지도 초기화 ----
  useEffect(() => {
    if (!ready || !mapDivRef.current || mapRef.current) return;

    const kakao = getKakao();
    const map = new kakao.maps.Map(mapDivRef.current, {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 5,
    });
    mapRef.current = map;
    clustererRef.current = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 7,
      gridSize: 60,
    });

    // 빈 지도 영역 클릭 → 열려있는 상세 시트 닫기 (마커 클릭은 marker.click 리스너가 selectPlace 를 먼저 실행하므로 영향 없음)
    kakao.maps.event.addListener(map, 'click', () => {
      setSelected(null);
    });

    // idle 재조회 (디바운스 400ms) — 위치기반 소스에서만
    kakao.maps.event.addListener(map, 'idle', () => {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        const src = CATEGORIES.find((c) => c.key === activeRef.current)?.source;
        if (src === 'nearby' || src === 'kakao') loadForView();
      }, 400);
    });

    loadForView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ---- 핸들러 ----
  function onChangeCategory(c) {
    activeRef.current = c.key;
    setActive(c.key);
    setSelected(null);
    loadForView();
  }

  function onGenre(g) {
    genreRef.current = g;
    setGenre(g);
    loadForView();
  }

  async function onSearch(keyword) {
    setLoading(true);
    try {
      const res = await mapApi.fetchPlacesByKeyword(keyword, langRef.current);
      setPlaces(res);
      renderMarkers(res);
      if (res.length === 0) {
        toast('검색 결과 없음');
        return;
      }
      const first = res.find((p) => p.lat != null && p.lng != null);
      if (first) mapRef.current?.panTo(new (getKakao().maps.LatLng)(first.lat, first.lng));
    } catch {
      toast.error('검색 실패 (백엔드/키 확인)');
    } finally {
      setLoading(false);
    }
  }

  function onQuickPick(name) {
    const loc = QUICK_PLACES[name];
    if (!loc) {
      toast(`${name}은(는) 미등록 — 등록 후 이용해 주세요`);
      return;
    }
    mapRef.current?.panTo(new (getKakao().maps.LatLng)(loc.lat, loc.lng));
  }

  function drawMyDot(loc) {
    const kakao = getKakao();
    if (myDotRef.current) myDotRef.current.setMap(null);
    const image = new kakao.maps.MarkerImage(MY_DOT, new kakao.maps.Size(22, 22), {
      offset: new kakao.maps.Point(11, 11),
    });
    myDotRef.current = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(loc.lat, loc.lng),
      image,
      zIndex: 5,
    });
    myDotRef.current.setMap(mapRef.current);
  }

  async function ensureMyLoc() {
    if (myLoc) return myLoc;
    try {
      const loc = await getCurrentPosition();
      setMyLoc(loc);
      drawMyDot(loc);
      return loc;
    } catch {
      toast('위치 권한이 필요해요');
      return null;
    }
  }

  async function onLocate() {
    try {
      const loc = await getCurrentPosition();
      setMyLoc(loc);
      drawMyDot(loc);
      mapRef.current?.panTo(new (getKakao().maps.LatLng)(loc.lat, loc.lng));
      // 이동 후 즉시 그 위치 기준 nearby 재조회 (idle 이벤트 기다리지 않음)
      loadForView();
    } catch (err) {
      const messages = {
        [GEO_ERROR.INSECURE]: 'HTTPS 로 열어야 위치를 쓸 수 있어요 — 기본 위치로 이동',
        [GEO_ERROR.UNSUPPORTED]: '이 브라우저는 위치 기능 미지원 — 기본 위치로 이동',
        [GEO_ERROR.DENIED]: '위치 권한이 거부됐어요 — 기본 위치로 이동',
        [GEO_ERROR.UNAVAILABLE]: '위치를 확인 못했어요 (GPS/네트워크) — 기본 위치로 이동',
        [GEO_ERROR.TIMEOUT]: '위치 확인이 오래 걸려요 — 기본 위치로 이동',
      };
      toast(messages[err.code] ?? '위치 조회 실패 — 기본 위치로 이동');
      mapRef.current?.panTo(new (getKakao().maps.LatLng)(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
    }
  }

  async function onFindRoute() {
    if (!selected || selected.lat == null || selected.lng == null) return;
    const me = await ensureMyLoc();
    if (!me) return;
    setRouting(true);
    const kakao = getKakao();
    try {
      const r = await mapApi.requestDirections({
        originLat: me.lat,
        originLng: me.lng,
        destLat: selected.lat,
        destLng: selected.lng,
      });
      if (!r.path || r.path.length === 0) throw new Error('no path');
      if (routeLineRef.current) routeLineRef.current.setMap(null);
      const path = r.path.map((pt) => new kakao.maps.LatLng(pt.lat, pt.lng));
      routeLineRef.current = new kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: '#7131F5',
        strokeOpacity: 0.9,
      });
      routeLineRef.current.setMap(mapRef.current);
      const bounds = new kakao.maps.LatLngBounds();
      path.forEach((pt) => bounds.extend(pt));
      mapRef.current.setBounds(bounds);
    } catch {
      toast('경로 탐색 실패 — 카카오맵으로 이동');
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(selected.title)},${selected.lat},${selected.lng}`,
        '_blank',
      );
    } finally {
      setRouting(false);
    }
  }

  /**
   * 카카오 내비/맵 앱 딥링크로 열기.
   * - 모바일: kakaonavi:// (턴바이턴) 시도 → 미설치 시 https://map.kakao.com/link/... 로 폴백 (Kakao Map Universal Link)
   * - 데스크톱: 바로 카카오맵 웹 새창
   * onFindRoute(지도 내 폴리라인)와 별개로 앱에서 실제 내비게이션 받고 싶을 때 사용.
   */
  function onOpenKakaoNavi() {
    if (!selected || selected.lat == null || selected.lng == null) return;
    const { title, lat, lng } = selected;
    const encodedTitle = encodeURIComponent(title ?? '목적지');
    const webUrl = `https://map.kakao.com/link/to/${encodedTitle},${lat},${lng}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobile) {
      window.open(webUrl, '_blank');
      return;
    }

    // 모바일: 카카오 내비앱 시도 (WGS84 좌표계)
    const naviUrl = `kakaonavi://navigate?name=${encodedTitle}&x=${lng}&y=${lat}&coord_type=wgs84`;
    // 앱 미설치 시 브라우저는 아무 반응 없음 → 1.5s 후에도 페이지 보이면 웹으로 폴백
    window.location.href = naviUrl;
    window.setTimeout(() => {
      if (document.visibilityState !== 'hidden') {
        window.location.href = webUrl;
      }
    }, 1500);
  }

  // 저장 토글: 미저장 → 저장 / 저장됨 → 취소
  // 백엔드 API 는 팀 bucket-lists 담당의 GET/DELETE/checkin 준비 전까지 500 이라 UI 상태만 낙관적 갱신하고
  // best-effort 로 mapApi 호출 (실패 무시). 이슈 #12 에서 팀 스펙(/bucket-lists)에 맞춰 실호출로 교체.
  async function onSave() {
    if (!selected) return;
    const id = selected.id;
    const wasSaved = saved.includes(id) || selected.inBucket;
    if (wasSaved) {
      setSaved((prev) => prev.filter((x) => x !== id));
      toast('저장 취소');
      mapApi.deleteBucket(id).catch(() => {});
      return;
    }
    setSaved((prev) => (prev.includes(id) ? prev : [...prev, id]));
    toast.success('저장 완료 🔖');
    mapApi
      .createBucket({
        contentId: id,
        contentTypeId: selected.contentTypeId ?? undefined,
        title: selected.title,
        lat: selected.lat,
        lng: selected.lng,
        thumbnail: selected.thumbnail ?? undefined,
        addr: selected.addr ?? undefined,
      })
      .catch(() => {});
  }

  // 방문 인증 (checkin): 100m 이내 도착 시 그린 마커/뱃지로 마킹.
  // 팀 #13(bucket-lists) checkin API 없어도 프론트에서 haversine 자체 검증으로 동작.
  // API 생기면 best-effort 로 함께 호출 → 서버측 verify 결과로 대체.
  async function onCheckoff() {
    if (!selected || selected.lat == null || selected.lng == null) return;
    const me = await ensureMyLoc();
    if (!me) return;
    const distanceM = haversineMeters(me.lat, me.lng, selected.lat, selected.lng);
    if (distanceM > 100) {
      toast(`100m 이내에서만 인증 가능 (약 ${Math.round(distanceM)}m 떨어짐)`);
      return;
    }
    const v = visitedRef.current.includes(selected.id)
      ? visitedRef.current
      : [...visitedRef.current, selected.id];
    visitedRef.current = v;
    setVisited(v);
    renderMarkers(places);
    toast.success('방문 인증 완료! 🎉');
    // 서버 API 붙으면 best-effort 로 통보 (실패해도 UI 는 이미 반영)
    mapApi
      .checkin({
        contentId: selected.id,
        placeLat: selected.lat,
        placeLng: selected.lng,
        userLat: me.lat,
        userLng: me.lng,
        title: selected.title,
        contentTypeId: selected.contentTypeId ?? undefined,
      })
      .catch(() => {});
  }

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

  return {
    ready,
    noKey,
    registerMapEl,
    active,
    genre,
    places,
    selectPlace,
    loading,
    selected,
    detail,
    detailLoading,
    routing,
    selectedSaved: selected ? saved.includes(selected.id) : false,
    selectedVisited: selected ? visited.includes(selected.id) : false,
    onChangeCategory,
    onGenre,
    onSearch,
    onQuickPick,
    onLocate,
    onFindRoute,
    onOpenKakaoNavi,
    onSave,
    onCheckoff,
    closeSheet: () => setSelected(null),
  };
}
