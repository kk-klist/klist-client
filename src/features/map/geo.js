// 기본 좌표: 명동 (서울 중구). 위치 권한이 거부/실패했을 때 첫 화면이 여기로 잡힌다.
// Pick(recommend) 장르 커버리지가 가장 넓은 지점이라 선택했다 (반경 2km 기준):
//   명동 K-drama 6 / K-food 8 / K-beauty 7  vs  가로수길 K-beauty 만 7
export const DEFAULT_CENTER = { lat: 37.5636, lng: 126.9827 };

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
