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

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
    );
  });
}
