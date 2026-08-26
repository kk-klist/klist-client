// 지도 카테고리 탭 정의 — source 로 데이터 출처 분기 (F-05)
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

// 버킷리스트 저장용 카테고리 — 서버 CategoryInitializer 시드 4종이 전부이고 @NotBlank 라 반드시 채워야 한다.
const GENRE_TO_BUCKET_CATEGORY = {
  'K-pop': 'K_POP',
  'K-drama': 'K_DRAMA',
  'K-food': 'K_FOOD',
  'K-beauty': 'K_BEAUTY',
};

// 음식/카페 탭은 K_FOOD 로 자연스럽게 매핑되지만, Tour·ATM·편의점·약국·축제는 대응되는 시드가 없다.
// 서버에 '기타' 카테고리가 없어 우선 K_POP 으로 보낸다 — 팀에 ETC 추가 요청 후 교체 필요.
const TAB_TO_BUCKET_CATEGORY = {
  FD6: 'K_FOOD',
  CE7: 'K_FOOD',
};

export const DEFAULT_BUCKET_CATEGORY = 'K_POP';

/** 저장 시 보낼 카테고리 코드를 현재 탭/장르에서 결정한다. */
export function resolveBucketCategory(activeTabKey, genre) {
  return (
    GENRE_TO_BUCKET_CATEGORY[genre] ??
    TAB_TO_BUCKET_CATEGORY[activeTabKey] ??
    DEFAULT_BUCKET_CATEGORY
  );
}
