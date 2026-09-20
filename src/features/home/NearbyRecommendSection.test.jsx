import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HomeLocaleContext, getHomeCopy } from './homeLocale';
import { NearbyRecommendSection } from './NearbyRecommendSection';
import { useNearbyRecommendQuery } from './homeApi';

vi.mock('./homeApi', () => ({
  useNearbyRecommendQuery: vi.fn(),
}));
vi.mock('./PlaceDetailDialog', () => ({
  PlaceDetailDialog: () => null,
}));

function renderSection(places, language = 'ko') {
  useNearbyRecommendQuery.mockReturnValue({
    places,
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  });
  return render(
    <HomeLocaleContext.Provider value={getHomeCopy(language)}>
      <NearbyRecommendSection />
    </HomeLocaleContext.Provider>,
  );
}

const place = (overrides) => ({
  id: '1',
  title: '장소',
  genre: null,
  contentTypeId: null,
  thumbnail: null,
  dist: 120,
  ...overrides,
});

describe('NearbyRecommendSection 카드 라벨', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('K-컬처 장르가 있으면 장르 라벨을 보여준다', () => {
    renderSection([place({ genre: 'K-food', contentTypeId: '39' })]);

    expect(screen.getByText('K-FOOD')).toBeInTheDocument();
    expect(screen.queryByText('음식점')).not.toBeInTheDocument();
  });

  it('장르가 없으면 contentTypeId로 분류 라벨을 보여준다', () => {
    renderSection([
      place({ id: '1', title: '엠블던호텔', contentTypeId: '32' }),
      place({ id: '2', title: '포크너', contentTypeId: '39' }),
      place({ id: '3', title: '안산문화예술의전당', contentTypeId: '14' }),
    ]);

    expect(screen.getByText('숙박')).toBeInTheDocument();
    expect(screen.getByText('음식점')).toBeInTheDocument();
    expect(screen.getByText('문화시설')).toBeInTheDocument();
    expect(screen.queryByText('K-CULTURE')).not.toBeInTheDocument();
  });

  it('영어 설정이면 분류 라벨도 영어로 보여준다', () => {
    renderSection([place({ contentTypeId: '32' })], 'en');

    expect(screen.getByText('Stay')).toBeInTheDocument();
  });

  it('영어 서비스의 contentTypeId(76/79/82)도 분류 라벨로 바꿔 보여준다', () => {
    renderSection(
      [
        place({ id: '1', title: 'Ikseon-dong Hanok Street', contentTypeId: '76' }),
        place({ id: '2', title: 'Gwangjang Market', contentTypeId: '79' }),
        place({ id: '3', title: 'Jokbal', contentTypeId: '82' }),
      ],
      'en',
    );

    expect(screen.getByText('Attraction')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('장르도 알려진 분류도 없으면 라벨을 보여주지 않는다', () => {
    renderSection([place({ title: '이름없는 장소', contentTypeId: '99' })]);

    expect(screen.getByText('이름없는 장소')).toBeInTheDocument();
    expect(screen.queryByText('K-CULTURE')).not.toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('span')).toBeNull();
  });
});
