import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateBucketListMutation } from './bucketApi';
import { BucketLocaleProvider } from './BucketLocaleProvider';
import { useCreateBucketList } from './useCreateBucketList';

vi.mock('./bucketApi', () => ({ useCreateBucketListMutation: vi.fn() }));

describe('useCreateBucketList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('입력한 제목, 설명, 카테고리로 직접 생성한다', async () => {
    const mutate = vi.fn((_request, options) => options.onSuccess());
    const onCreated = vi.fn();
    useCreateBucketListMutation.mockReturnValue({ mutate, isPending: false });
    const wrapper = ({ children }) => (
      <BucketLocaleProvider language="ko">{children}</BucketLocaleProvider>
    );
    const { result } = renderHook(() => useCreateBucketList(true, onCreated), { wrapper });

    act(() => {
      result.current.form.setValue('title', '부산에서 밀면 먹기');
      result.current.form.setValue('description', '여름 여행 목표');
      result.current.form.setValue('category', 'K_FOOD');
    });
    await act(async () => result.current.handleSubmit({ preventDefault: vi.fn() }));

    expect(mutate).toHaveBeenCalledWith(
      {
        title: '부산에서 밀면 먹기',
        description: '여름 여행 목표',
        category: 'K_FOOD',
        placeName: null,
        address: null,
        latitude: null,
        longitude: null,
        imageUrl: null,
      },
      expect.any(Object),
    );
    expect(onCreated).toHaveBeenCalledOnce();
  });

  it('카테고리를 선택하지 않으면 생성 요청을 보내지 않는다', async () => {
    const mutate = vi.fn();
    useCreateBucketListMutation.mockReturnValue({ mutate, isPending: false });
    const { result } = renderHook(() => useCreateBucketList(true, vi.fn()));

    act(() => result.current.form.setValue('title', '직접 추가'));
    await act(async () => result.current.handleSubmit({ preventDefault: vi.fn() }));

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState('category').error?.message).toBe(
      'Please select a category.',
    );
  });
});
