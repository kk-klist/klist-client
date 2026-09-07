import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BucketListItem } from './BucketListItem';
import { BucketLocaleProvider } from './BucketLocaleProvider';
import { useToggleBucketCompletion } from './useToggleBucketCompletion';

vi.mock('./useToggleBucketCompletion', () => ({
  useToggleBucketCompletion: vi.fn(),
}));

const bucketList = {
  bucketListId: 12,
  title: '한복 입고 경복궁 가기',
  category: 'K_DRAMA',
  isCompleted: false,
};

describe('BucketListItem', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('미완료 항목의 체크 버튼을 누르면 완료 상태 변경을 요청한다', async () => {
    const toggleCompletion = vi.fn();
    useToggleBucketCompletion.mockReturnValue({ isPending: false, toggleCompletion });
    render(
      <BucketLocaleProvider language="ko">
        <BucketListItem bucketList={bucketList} />
      </BucketLocaleProvider>,
    );

    expect(screen.getByText('미완료')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '완료하기' }));

    expect(toggleCompletion).toHaveBeenCalledOnce();
  });

  it('완료 상태 변경 중에는 체크 버튼을 비활성화한다', () => {
    useToggleBucketCompletion.mockReturnValue({ isPending: true, toggleCompletion: vi.fn() });
    render(<BucketListItem bucketList={bucketList} />);

    expect(screen.getByRole('button', { name: 'Mark as completed' })).toBeDisabled();
  });

  it('카드 내용을 누르면 버킷리스트 상세를 연다', async () => {
    const onSelect = vi.fn();
    useToggleBucketCompletion.mockReturnValue({ isPending: false, toggleCompletion: vi.fn() });
    render(<BucketListItem bucketList={bucketList} onSelect={onSelect} />);

    await userEvent.click(
      screen.getByRole('button', { name: '한복 입고 경복궁 가기 View details' }),
    );

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
