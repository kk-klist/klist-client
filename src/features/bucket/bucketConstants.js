export const BUCKET_TABS = [
  { label: 'My Bucket List', value: 'my' },
  { label: 'Recommended', value: 'recommended' },
];

export const BUCKET_CATEGORIES = [
  { label: 'All', value: 'ALL' },
  { label: 'K-POP', value: 'K_POP' },
  { label: 'K-DRAMA', value: 'K_DRAMA' },
  { label: 'K-FOOD', value: 'K_FOOD' },
  { label: 'K-BEAUTY', value: 'K_BEAUTY' },
];

export const CATEGORY_STYLES = {
  K_POP: { label: 'K-POP', color: 'text-kpop', gradient: 'kb-grad-kpop' },
  K_DRAMA: { label: 'K-DRAMA', color: 'text-kdrama', gradient: 'kb-grad-kdrama' },
  K_FOOD: { label: 'K-FOOD', color: 'text-kfood', gradient: 'kb-grad-kfood' },
  K_BEAUTY: { label: 'K-BEAUTY', color: 'text-kbeauty', gradient: 'kb-grad-kbeauty' },
};

export const DEFAULT_FILTERS = {
  tab: 'my',
  category: 'ALL',
  sort: 'DISTANCE',
  page: 0,
};

export const RECOMMENDATION_SORTS = [
  { label: '가까운 순', value: 'DISTANCE' },
  { label: '가나다순', value: 'TITLE_ASC' },
];
