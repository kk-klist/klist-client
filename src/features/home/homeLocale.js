import { createContext, useContext } from 'react';

const COPY = {
  ko: {
    greeting: (name) => (name ? `안녕하세요, ${name}님` : '안녕하세요'),

    weatherError: '날씨 정보를 불러올 수 없어요.',
    weatherEmpty: '날씨 정보가 없어요.',
    todayOutfit: '오늘의 추천 복장',
    observedAtSuffix: '기준',
    conditionLabels: {
      SUNNY: '맑음',
      RAINY: '비',
      SLEET: '진눈깨비',
      SNOWY: '눈',
      SHOWER: '소나기',
      WINDY: '강풍',
    },

    nearbySectionTitle: '지금, 내 주변에서',
    nearbyError: '근처 추천을 불러올 수 없어요.',
    nearbyEmpty: '근처 추천 장소가 없어요.',

    placeDetailError: '상세 정보를 불러올 수 없어요.',
    placeDetailEmpty: '상세 정보가 없어요.',
    close: '닫기',
    restDatePrefix: '휴무일',
    expand: '자세히 보기',
    collapse: '접기',
    addToBucket: '버킷리스트에 담기',

    loginPromptProgress: '로그인하고 진행률 확인하기',
    progressError: '진행률을 불러올 수 없어요.',
    progressEmpty: '아직 등록한 버킷리스트가 없어요.',
    progressLabel: '버킷리스트 진행률',
    done: '완료',
    streak: '7일 연속 달성',
    badges: '배지 3개',

    loginPromptCheckin: '로그인하고 근처 체크인 확인하기',
    checkinError: '근처 체크인 정보를 불러올 수 없어요.',
    checkinEmpty: '근처에 체크인할 버킷리스트가 없어요.',
    nearbyYou: (place) => `근처에 있어요 · ${place}`,
    tapToCheckin: '탭해서 체크인하고 완료하기',

    myBucketListTitle: '내 버킷리스트',
    viewAll: '전체 보기 ›',
    loginPromptBucketList: '로그인하고 버킷리스트 확인하기',
    bucketListError: '버킷리스트를 불러올 수 없어요.',
    bucketListEmpty: '아직 등록한 버킷리스트가 없어요.',

    addSheetTitle: '버킷리스트에 담기',
    addSheetDescription: '어떤 목표로 담을지 적어주세요.',
    titleLabel: '제목',
    titlePlaceholder: '예: 한복 입고 궁궐 산책하기',
    placeLabel: '장소',
    categoryLabel: '카테고리',
    descriptionLabel: '설명',
    cancel: '취소',
    adding: '담는 중...',
    save: '담기',
    addSuccess: '버킷리스트에 담았어요.',
    addError: '버킷리스트에 담지 못했어요.',
    titleRequired: '제목을 입력해주세요.',
    titleTooLong: '제목은 100자 이하로 입력해주세요.',
    categoryRequired: '카테고리를 선택해주세요.',
    descriptionTooLong: '설명은 300자 이하로 입력해주세요.',
  },
  en: {
    greeting: (name) => (name ? `Hi, ${name}` : 'Hi there'),

    weatherError: 'Could not load the weather.',
    weatherEmpty: 'No weather information available.',
    todayOutfit: "Today's outfit pick",
    observedAtSuffix: 'as of',
    conditionLabels: {
      SUNNY: 'Sunny',
      RAINY: 'Rainy',
      SLEET: 'Sleet',
      SNOWY: 'Snowy',
      SHOWER: 'Showers',
      WINDY: 'Windy',
    },

    nearbySectionTitle: 'Do it now · near you',
    nearbyError: 'Could not load nearby recommendations.',
    nearbyEmpty: 'No nearby recommendations available.',

    placeDetailError: 'Could not load the details.',
    placeDetailEmpty: 'No details available.',
    close: 'Close',
    restDatePrefix: 'Closed',
    expand: 'Read more',
    collapse: 'Show less',
    addToBucket: 'Add to bucket list',

    loginPromptProgress: 'Log in to see your progress',
    progressError: 'Could not load your progress.',
    progressEmpty: "You haven't added any bucket list items yet.",
    progressLabel: 'Bucket list progress',
    done: 'done',
    streak: '7-day streak',
    badges: '3 badges',

    loginPromptCheckin: 'Log in to see nearby check-ins',
    checkinError: 'Could not load nearby check-in information.',
    checkinEmpty: 'No bucket list items to check in nearby.',
    nearbyYou: (place) => `You’re nearby · ${place}`,
    tapToCheckin: 'Tap to check in & complete',

    myBucketListTitle: 'My bucket list',
    viewAll: 'View all ›',
    loginPromptBucketList: 'Log in to see your bucket list',
    bucketListError: 'Could not load your bucket list.',
    bucketListEmpty: "You haven't added any bucket list items yet.",

    addSheetTitle: 'Add to bucket list',
    addSheetDescription: 'Write down what you want to do here.',
    titleLabel: 'Title',
    titlePlaceholder: 'e.g. Take a palace walk in hanbok',
    placeLabel: 'Place',
    categoryLabel: 'Category',
    descriptionLabel: 'Description',
    cancel: 'Cancel',
    adding: 'Adding...',
    save: 'Add',
    addSuccess: 'Added to your bucket list.',
    addError: 'Could not add this place to your bucket list.',
    titleRequired: 'Please enter a title.',
    titleTooLong: 'The title must be 100 characters or fewer.',
    categoryRequired: 'Please select a category.',
    descriptionTooLong: 'The description must be 300 characters or fewer.',
  },
};

export const HomeLocaleContext = createContext(COPY.en);

export function getHomeCopy(language) {
  return language === 'ko' ? COPY.ko : COPY.en;
}

export function useHomeCopy() {
  return useContext(HomeLocaleContext);
}
