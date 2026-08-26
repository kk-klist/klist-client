import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from '@/shared/utils/toast';
import {
  getSavedPlaces,
  setSavedPlaces as writeSavedPlaces,
  attachBucketListId,
  getBucketListId,
  mergeServerBuckets,
} from '@/shared/utils/savedPlacesStore';
import { useKakaoLoader, getKakao } from './useKakaoLoader';
import * as mapApi from './mapApi';
import { DEFAULT_CENTER, QUICK_PLACES, radiusForLevel } from './geo';
import { getCurrentPosition, GEO_ERROR } from '@/shared/utils/geo';
import { PURPLE_PIN, RED_PIN, TEAL_PIN, MY_DOT } from './pins';
import { CATEGORIES, resolveBucketCategory } from './mapConstants';

// TourAPI 가 지원하는 언어 화이트리스트. 미매칭 시 기본 'ko'.
// 지금은 지도 페이지 URL query param(?lang=en)으로만 관리한다.
// 추후 마이페이지 Language 설정 or 온보딩 언어 선택이 붙으면 전역 store 로 승격 예정 (기준문서 참고).
const SUPPORTED_LANGS = new Set(['ko', 'en', 'ja', 'zh-CN', 'zh-TW']);
function resolveLang(search) {
  const raw = new URLSearchParams(search).get('lang');
  return raw && SUPPORTED_LANGS.has(raw) ? raw : 'ko';
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
  // saved(id 배열)와 savedPlaces(전체 Place)를 함께 유지. shared store 로 새로고침 시 복원.
  // 팀 #13(bucket-lists) 조회 API 붙으면 shared/savedPlacesStore 내부만 서버 호출로 교체.
  const [savedPlaces, setSavedPlaces] = useState(getSavedPlaces);
  const [saved, setSaved] = useState(() => getSavedPlaces().map((p) => p.id));
  const [myLoc, setMyLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  // 카카오 JS 키 미설정 여부는 env 에서 바로 계산 (effect 내 setState 회피)
  const key = import.meta.env.VITE_KAKAO_JS_KEY;
  const noKey = !key || key.startsWith('여기에');

  // ---- 최초 1회: 서버에서 저장/방문 상태 동기화 (비로그인·서버 오류 시 localStorage 값 유지) ----
  // 서버 응답에는 contentId 가 없으므로 로컬 매핑으로 보강한 뒤 지도 식별자(id)를 뽑는다.
  useEffect(() => {
    (async () => {
      try {
        const merged = mergeServerBuckets(await mapApi.fetchBuckets());
        setSaved(merged.map((b) => b.id));
        const v = merged.filter((b) => b.isVisited).map((b) => b.id);
        visitedRef.current = v;
        setVisited(v);
        // 서버가 정본이므로 로컬 저장분도 최신 상태로 덮어써 마커 색이 어긋나지 않게 한다.
        setSavedPlaces(merged);
      } catch {
        /* 비로그인(401)/백엔드 미기동 시 조용히 스킵 — 초기화 시 localStorage 값 이미 로드됨 */
      }
    })();
  }, []);

  // savedPlaces 바뀔 때마다 shared store 로 지속화 (마이페이지도 이 store 소비)
  useEffect(() => {
    writeSavedPlaces(savedPlaces);
  }, [savedPlaces]);

  // 저장/방문 상태 하이드레이션이 초기 렌더보다 늦게 끝나도 마커 색이 반영되게 재렌더
  useEffect(() => {
    if (places.length > 0) renderMarkers(places);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited, savedPlaces]);

  // URL ?lang= 변경 시 langRef 갱신 + 현재 카테고리 재조회 (지도가 이미 뜬 뒤에만)
  useEffect(() => {
    langRef.current = lang;
    if (mapRef.current) loadForView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ---- 마커 렌더 (이전 마커 전부 제거 후 새로 그림) ----
  // 3분기: 방문 완료(그린) > 저장 미방문(레드) > 미저장(보라)
  function renderMarkers(list) {
    const kakao = getKakao();
    const cl = clustererRef.current;
    if (!cl) return;
    cl.clear();
    const savedById = new Map(savedPlaces.map((p) => [p.id, p]));
    const visitedIds = new Set(visited);
    const markers = list
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => {
        const savedEntry = savedById.get(p.id);
        const isSaved = p.inBucket || !!savedEntry;
        const isVisited = visitedIds.has(p.id) || savedEntry?.isVisited === true;
        const pin = isVisited ? TEAL_PIN : isSaved ? RED_PIN : PURPLE_PIN;
        const image = new kakao.maps.MarkerImage(pin, new kakao.maps.Size(30, 40), {
          offset: new kakao.maps.Point(15, 40),
        });
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
    if (!/^\d+$/.test(p.id)) return; // 카카오 POI 는 TourAPI 상세 없음
    // 서버 버킷 항목은 contentId 가 없어 id 가 bucketListId 인 상태 → 엉뚱한 콘텐츠를 조회하게 되므로 건너뛴다.
    // (로컬 매핑으로 contentId 가 복원된 경우에만 상세 조회가 가능하다)
    if (p.bucketListId != null && p.id === p.bucketListId) return;
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
      // MyList 는 서버(/bucket-lists)가 정본. 비로그인(401)이거나 서버 오류면 로컬 저장분으로 폴백한다.
      if (cat.source === 'mylist') {
        result = await mapApi
          .fetchBuckets()
          .then((list) => mergeServerBuckets(list))
          .catch(() => savedPlaces);
      } else if (cat.source === 'recommend')
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

  // 저장 토글: 미저장 → 저장 / 저장됨 → 취소.
  // UI 는 낙관적으로 먼저 갱신하고 서버 호출은 best-effort — 비로그인(401)이어도 로컬 저장은 유지된다.
  async function onSave() {
    if (!selected) return;
    const id = selected.id;
    const wasSaved =
      saved.includes(id) || savedPlaces.some((p) => p.id === id) || selected.inBucket;
    if (wasSaved) {
      const bucketListId = selected.bucketListId ?? getBucketListId(id);
      setSaved((prev) => prev.filter((x) => x !== id));
      setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
      toast('저장 취소');
      if (bucketListId != null) mapApi.deleteBucket(bucketListId).catch(() => {});
      // MyList 탭이 활성이면 마커 목록 즉시 반영
      if (activeRef.current === 'mylist') {
        const next = savedPlaces.filter((p) => p.id !== id);
        setPlaces(next);
        renderMarkers(next);
      }
      return;
    }
    // 미저장 → 저장 : id 목록 + 전체 객체 둘 다 업데이트
    setSaved((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSavedPlaces((prev) =>
      prev.some((p) => p.id === id)
        ? prev
        : [
            ...prev,
            {
              id,
              contentTypeId: selected.contentTypeId ?? null,
              title: selected.title,
              lat: selected.lat,
              lng: selected.lng,
              thumbnail: selected.thumbnail ?? null,
              addr: selected.addr ?? null,
              isVisited: false,
            },
          ],
    );
    toast.success('저장 완료 🔖');
    // 서버 스키마에 contentId 자리가 없어 개별 필드로 매핑한다. 성공 시 bucketListId 를 로컬에 붙여둔다.
    mapApi
      .createBucket({
        title: selected.title,
        category: resolveBucketCategory(activeRef.current, genreRef.current),
        placeName: selected.title,
        address: selected.addr ?? undefined,
        latitude: selected.lat,
        longitude: selected.lng,
        imageUrl: selected.thumbnail ?? undefined,
      })
      .then((res) => {
        if (res?.bucketListId == null) return;
        attachBucketListId(id, res.bucketListId);
        setSavedPlaces((prev) =>
          prev.map((p) => (p.id === id ? { ...p, bucketListId: res.bucketListId } : p)),
        );
      })
      .catch(() => {});
  }

  // 방문 인증: 100m 이내 도착 시 그린 마커/뱃지로 마킹.
  // 서버에는 거리 검증이 없고 completion 플래그만 있으므로, 검증은 프론트 haversine 이 담당하고
  // 통과했을 때만 PATCH /bucket-lists/{id}/completion 을 호출한다.
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
    // MyList 로 저장한 장소라면 isVisited=true 로 마킹 → 새로고침 후에도 그린 유지 (localStorage 지속)
    setSavedPlaces((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, isVisited: true } : p)),
    );
    toast.success('방문 인증 완료! 🎉');
    // 서버에 반영 (실패해도 UI 는 이미 반영됨). 저장 전 장소는 bucketListId 가 없어 로컬만 유지된다.
    const bucketListId = selected.bucketListId ?? getBucketListId(selected.id);
    if (bucketListId != null) mapApi.setBucketCompletion(bucketListId, true).catch(() => {});
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
    selectedVisited: selected
      ? visited.includes(selected.id) ||
        savedPlaces.some((p) => p.id === selected.id && p.isVisited === true)
      : false,
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
