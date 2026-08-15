// 데모 기본 좌표: KSPO DOME (서울 송파 올림픽공원)
export const DEFAULT_CENTER = { lat: 37.5209, lng: 127.123 };

// 퀵 액세스 칩 좌표 (My Hotel 은 미등록 → 등록 유도)
export const QUICK_PLACES = {
  Airport: { lat: 37.4602, lng: 126.4407 }, // 인천국제공항
  'My Hotel': null,
  'KSPO DOME': { lat: 37.5209, lng: 127.123 },
};

// 카카오 지도 level → 검색 반경(m) 환산 (TourAPI 최대 20km 캡)
export function radiusForLevel(level) {
  const table = { 1: 250, 2: 500, 3: 1000, 4: 1500, 5: 2500, 6: 4000, 7: 8000, 8: 16000 };
  return Math.min(table[level] ?? 2000, 20000);
}

// getCurrentPosition 결과 에러 코드 (호출부에서 사용자 안내 분기용).
// - insecure: HTTP 등 비보안 컨텍스트 (브라우저가 geolocation 자체를 차단)
// - unsupported: 브라우저가 navigator.geolocation 미지원
// - denied: 사용자가 위치 권한 거부
// - unavailable: 위치 결정 실패 (GPS/네트워크 문제)
// - timeout: 8초 안에 응답 못 받음
export const GEO_ERROR = Object.freeze({
  INSECURE: 'insecure',
  UNSUPPORTED: 'unsupported',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  TIMEOUT: 'timeout',
});

function makeGeoError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    // HTTPS(또는 localhost) 가 아니면 브라우저가 geolocation 자체를 차단하므로 먼저 안내
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      reject(makeGeoError(GEO_ERROR.INSECURE, '보안 연결(HTTPS)에서만 위치를 사용할 수 있어요.'));
      return;
    }
    if (!navigator.geolocation) {
      reject(makeGeoError(GEO_ERROR.UNSUPPORTED, '이 브라우저는 위치 기능을 지원하지 않아요.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        // PositionError 표준 코드: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        if (err.code === 1) reject(makeGeoError(GEO_ERROR.DENIED, '위치 권한이 거부되었어요.'));
        else if (err.code === 2)
          reject(makeGeoError(GEO_ERROR.UNAVAILABLE, '위치를 확인할 수 없어요 (GPS/네트워크).'));
        else if (err.code === 3)
          reject(makeGeoError(GEO_ERROR.TIMEOUT, '위치 확인이 오래 걸려요.'));
        else reject(makeGeoError(GEO_ERROR.UNAVAILABLE, err.message || '위치 조회 실패'));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
    );
  });
}
