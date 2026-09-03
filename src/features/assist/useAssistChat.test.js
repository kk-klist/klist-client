import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from '@/shared/utils/toast';
import { useAssistChat } from './useAssistChat';

const mutations = vi.hoisted(() => ({
  create: { isPending: false, error: null, mutateAsync: vi.fn() },
  text: { isPending: false, mutateAsync: vi.fn() },
  audio: { isPending: false, mutateAsync: vi.fn() },
}));

vi.mock('./assistApi', () => ({
  useCreateChatSessionMutation: () => mutations.create,
  useSendChatQueryMutation: () => mutations.text,
  useSendChatAudioQueryMutation: () => mutations.audio,
}));
vi.mock('@/shared/utils/toast', () => ({ toast: { error: vi.fn() } }));

describe('useAssistChat 음성 질문', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutations.create.mutateAsync.mockResolvedValue({ sessionId: 'session-1' });
  });

  afterEach(cleanup);

  async function startChat(result) {
    await act(() => result.current.startNewChat());
    await waitFor(() => expect(result.current.sessionId).toBe('session-1'));
  }

  it('transcription과 answer를 기존 메시지 형식으로 추가한다', async () => {
    mutations.audio.mutateAsync.mockResolvedValue({
      transcription: '홍대 맛집 알려줘',
      answer: '홍대 떡볶이집을 추천할게요.',
      status: 'COMPLETED',
      suggestions: ['카페도 알려줘'],
    });
    const { result } = renderHook(() => useAssistChat());
    await startChat(result);

    await act(() => result.current.sendAudio(new File(['voice'], 'voice.webm')));

    expect(result.current.messages).toMatchObject([
      { role: 'user', content: '홍대 맛집 알려줘' },
      {
        role: 'assistant',
        content: '홍대 떡볶이집을 추천할게요.',
        status: 'COMPLETED',
        suggestions: ['카페도 알려줘'],
      },
    ]);
  });

  it('처리 중인 음성 요청과 중복되는 질문을 막는다', async () => {
    let resolveAudio;
    mutations.audio.mutateAsync.mockReturnValue(
      new Promise((resolve) => {
        resolveAudio = resolve;
      }),
    );
    const { result } = renderHook(() => useAssistChat());
    await startChat(result);

    let firstRequest;
    act(() => {
      firstRequest = result.current.sendAudio(new File(['voice'], 'voice.webm'));
    });
    await expect(result.current.sendMessage('중복 질문')).resolves.toBe(false);
    resolveAudio({ transcription: '음성 질문', answer: '답변' });
    await act(() => firstRequest);

    expect(mutations.audio.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.text.mutateAsync).not.toHaveBeenCalled();
  });

  it('잘못된 STT 응답을 친화적인 문구로 안내한다', async () => {
    mutations.audio.mutateAsync.mockRejectedValue({ code: 'STT_INVALID_RESPONSE' });
    const { result } = renderHook(() => useAssistChat());
    await startChat(result);

    await act(() => result.current.sendAudio(new File(['voice'], 'voice.webm')));

    expect(toast.error).toHaveBeenCalledWith(
      '음성을 이해하지 못했어요. 더 또렷하게 녹음하거나 다른 파일을 선택해 주세요.',
    );
  });
});
