import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BucketDetailSheet } from './BucketDetailSheet';
import { useBucketListQuery } from './bucketApi';
import { useToggleBucketCompletion } from './useToggleBucketCompletion';

vi.mock('./bucketApi', () => ({
  useBucketListQuery: vi.fn(),
}));

vi.mock('./useToggleBucketCompletion', () => ({
  useToggleBucketCompletion: vi.fn(),
}));

describe('BucketDetailSheet', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('선택한 버킷리스트의 장소 상세 정보와 액션을 표시한다', () => {
    const bucketList = {
      bucketListId: 12,
      title: '한복 입고 경복궁 가기',
      category: 'K_DRAMA',
      placeName: '경복궁',
      address: '서울특별시 종로구',
      description: '한복을 입고 궁궐을 둘러보세요.',
      latitude: 37.5796,
      longitude: 126.977,
      isCompleted: false,
    };
    useBucketListQuery.mockReturnValue({ data: bucketList, isLoading: false });
    useToggleBucketCompletion.mockReturnValue({ isPending: false, toggleCompletion: vi.fn() });

    render(<BucketDetailSheet bucketList={bucketList} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('heading', { name: bucketList.title })).toBeInTheDocument();
    expect(screen.getByText(bucketList.description)).toBeInTheDocument();
    expect(screen.queryByText(/TourAPI/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Navigate/ })).toHaveAttribute(
      'href',
      expect.stringContaining('map.kakao.com'),
    );
    expect(screen.getByRole('button', { name: 'Mark as completed' })).toBeInTheDocument();
  });

  it('완료된 버킷리스트의 완료일을 표시한다', () => {
    const bucketList = {
      bucketListId: 12,
      title: '한복 입고 경복궁 가기',
      category: 'K_DRAMA',
      placeName: '경복궁',
      isCompleted: true,
      completedAt: '2026-09-07T14:30:00',
    };
    useBucketListQuery.mockReturnValue({ data: bucketList, isLoading: false });
    useToggleBucketCompletion.mockReturnValue({ isPending: false, toggleCompletion: vi.fn() });

    render(<BucketDetailSheet bucketList={bucketList} open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Completed on: Sep 7, 2026')).toBeInTheDocument();
  });
});
