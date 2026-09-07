import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateBucketCompletionMutation } from './bucketApi';
import { useToggleBucketCompletion } from './useToggleBucketCompletion';
import { toast } from '@/shared/utils/toast';

vi.mock('./bucketApi', () => ({
  useUpdateBucketCompletionMutation: vi.fn(),
}));

vi.mock('@/shared/utils/toast', () => ({
  toast: { error: vi.fn() },
}));

describe('useToggleBucketCompletion', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateBucketCompletionMutation.mockReturnValue({ isPending: false, mutate });
  });

  it('현재 완료 상태의 반대 값으로 변경을 요청한다', () => {
    const { result } = renderHook(() =>
      useToggleBucketCompletion({ bucketListId: 12, isCompleted: false }),
    );

    act(() => result.current.toggleCompletion());

    expect(mutate).toHaveBeenCalledWith(
      { bucketListId: 12, isCompleted: true },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('완료 상태 변경에 실패하면 서버 메시지를 표시한다', () => {
    const { result } = renderHook(() =>
      useToggleBucketCompletion({ bucketListId: 12, isCompleted: true }),
    );

    act(() => result.current.toggleCompletion());
    const [, options] = mutate.mock.calls[0];
    options.onError({ message: '완료 상태를 변경하지 못했습니다.' });

    expect(toast.error).toHaveBeenCalledWith('완료 상태를 변경하지 못했습니다.');
  });
});
