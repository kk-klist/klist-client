import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateBucketCompletionMutation } from './bucketApi';
import { client } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  client: { get: vi.fn(), patch: vi.fn() },
}));

describe('useUpdateBucketCompletionMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('완료 상태를 변경하고 버킷 목록과 진행률 캐시를 갱신한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    client.patch.mockResolvedValue(undefined);
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdateBucketCompletionMutation(), { wrapper });

    act(() => {
      result.current.mutate({ bucketListId: 12, isCompleted: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.patch).toHaveBeenCalledWith('/api/v1/bucket-lists/12/completion', {
      isCompleted: true,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['bucket'] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['home', 'bucketProgress'] });
  });
});
