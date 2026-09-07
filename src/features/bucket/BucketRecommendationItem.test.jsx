import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BucketRecommendationItem } from './BucketRecommendationItem';

describe('BucketRecommendationItem', () => {
  afterEach(cleanup);

  it('추천 카드를 누르면 상세를 연다', async () => {
    const onSelect = vi.fn();
    render(
      <BucketRecommendationItem
        recommendation={{
          contentId: '1',
          title: '경복궁',
          distanceMeters: 1800,
          category: 'K_DRAMA',
        }}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '경복궁 View details' }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.getByText('K-DRAMA')).toBeInTheDocument();
    expect(screen.getByText('1.8km')).toBeInTheDocument();
  });

  it('이미 추가된 추천 장소에 상태를 표시한다', () => {
    render(
      <BucketRecommendationItem
        recommendation={{ contentId: '1', title: '경복궁', category: 'K_DRAMA' }}
        isAdded
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('✓ Already Added')).toBeInTheDocument();
  });
});
