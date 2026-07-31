// 지도 카테고리 탭 정의 — source 로 데이터 출처 분기 (F-05)
// mylist 는 페이지 헤더의 "My List" 필이 담당하므로 칩 행에서는 숨긴다.
export const CATEGORIES = [
  { key: 'mylist', label: 'My List', source: 'mylist' },
  { key: 'recommend', label: 'Pick', source: 'recommend' }, // 추천(인기순=담은 수)
  { key: 'nearby', label: 'Tour', source: 'nearby' },
  { key: 'FD6', label: 'Food', source: 'kakao' },
  { key: 'CE7', label: 'Cafe', source: 'kakao' },
  { key: 'BK9', label: 'ATM', source: 'kakao' },
  { key: 'CS2', label: 'Convenience', source: 'kakao' },
  { key: 'PM9', label: 'Pharmacy', source: 'kakao' },
  { key: 'festival', label: 'Pop-up', source: 'festival' },
];

export const GENRES = ['K-pop', 'K-drama', 'K-food', 'K-beauty'];
