import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateBucketCompletionMutation } from './homeApi';
import { getHomeCopy } from './homeLocale';
import { useCompleteCheckin } from './useCompleteCheckin';
import { toast } from '@/shared/utils/toast';

vi.mock('./homeApi', async () => {
  const actual = await vi.importActual('./homeApi');
  return {
    ...actual,
    useUpdateBucketCompletionMutation: vi.fn(),
  };
});

vi.mock('@/shared/utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const copy = getHomeCopy('en');

describe('useCompleteCheckin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('탭하면 해당 버킷리스트를 완료(isCompleted: true)로 요청한다', () => {
    const mutate = vi.fn();
    useUpdateBucketCompletionMutation.mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useCompleteCheckin());

    result.current.completeCheckin(42);

    expect(mutate).toHaveBeenCalledWith(
      { bucketListId: 42, isCompleted: true },
      expect.any(Object),
    );
  });

  it('성공하면 체크인 완료 토스트를 보여준다', () => {
    const mutate = vi.fn((_variables, options) => options.onSuccess());
    useUpdateBucketCompletionMutation.mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useCompleteCheckin());

    result.current.completeCheckin(42);

    expect(toast.success).toHaveBeenCalledWith(copy.checkinSuccess);
  });

  it('실패하면 서버 message를 토스트로 보여준다', () => {
    const mutate = vi.fn((_variables, options) =>
      options.onError({ code: 'BUCKET_LIST_NOT_FOUND', message: '버킷리스트를 찾을 수 없어요.' }),
    );
    useUpdateBucketCompletionMutation.mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useCompleteCheckin());

    result.current.completeCheckin(42);

    expect(toast.error).toHaveBeenCalledWith('버킷리스트를 찾을 수 없어요.');
  });

  it('서버 message가 없으면 기본 실패 문구를 보여준다', () => {
    const mutate = vi.fn((_variables, options) => options.onError(undefined));
    useUpdateBucketCompletionMutation.mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useCompleteCheckin());

    result.current.completeCheckin(42);

    expect(toast.error).toHaveBeenCalledWith(copy.checkinCompleteError);
  });

  it('처리 중에는 중복 요청을 보내지 않는다', () => {
    const mutate = vi.fn();
    useUpdateBucketCompletionMutation.mockReturnValue({ mutate, isPending: true });
    const { result } = renderHook(() => useCompleteCheckin());

    result.current.completeCheckin(42);

    expect(mutate).not.toHaveBeenCalled();
  });
});
