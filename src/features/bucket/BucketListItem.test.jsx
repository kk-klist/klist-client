import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BucketListItem } from './BucketListItem';
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
    render(<BucketListItem bucketList={bucketList} />);

    await userEvent.click(screen.getByRole('button', { name: '완료 처리' }));

    expect(toggleCompletion).toHaveBeenCalledOnce();
  });

  it('완료 상태 변경 중에는 체크 버튼을 비활성화한다', () => {
    useToggleBucketCompletion.mockReturnValue({ isPending: true, toggleCompletion: vi.fn() });
    render(<BucketListItem bucketList={bucketList} />);

    expect(screen.getByRole('button', { name: '완료 처리' })).toBeDisabled();
  });
});
