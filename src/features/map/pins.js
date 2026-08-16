// 마커 핀 SVG (data URI). 색상은 K-BUCKET v2 디자인 토큰과 동일 값.
function svg(body) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(body);
}

const primary = '#7131F5'; // 미저장 (브랜드 보라)
const danger = '#ef4444'; // 저장 미방문 (레드)
const success = '#34c759'; // 방문완료 (성공 그린)

// 미저장 핀 (보라) — 지도에 뜬 일반 관광지 마커
export const PURPLE_PIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="${primary}"/>
    <circle cx="15" cy="15" r="6" fill="#fff"/>
  </svg>`,
);

// 저장했으나 미방문 핀 (레드 + 북마크) — My List 에 담긴 아직 안 가본 장소
export const RED_PIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="${danger}"/>
    <path d="M11 9h8v10l-4-2.5L11 19V9z" fill="#fff"/>
  </svg>`,
);

// 방문 완료 핀 (그린 + 체크)
export const TEAL_PIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="${success}"/>
    <path d="M9 15l4 4 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
);

// 내 위치 점
export const MY_DOT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="9" fill="#7131F5" fill-opacity="0.25"/>
    <circle cx="11" cy="11" r="5" fill="#7131F5" stroke="#fff" stroke-width="2"/>
  </svg>`,
);
