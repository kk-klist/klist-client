import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import authReducer from '@/features/auth/authSlice';
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

function renderChatHook() {
  const store = configureStore({ reducer: { auth: authReducer } });
  return renderHook(() => useAssistChat(), {
    wrapper: ({ children }) => createElement(Provider, { store }, children),
  });
}

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
    const { result } = renderChatHook();
    expect(result.current.language).toBe('ko');
    await startChat(result);

    const audio = new File(['voice'], 'voice.webm');
    await act(() => result.current.sendAudio(audio));
    expect(mutations.audio.mutateAsync).toHaveBeenCalledWith({
      sessionId: 'session-1',
      audio,
      language: 'ko',
    });

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
    const { result } = renderChatHook();
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
    const { result } = renderChatHook();
    await startChat(result);

    await act(() => result.current.sendAudio(new File(['voice'], 'voice.webm')));

    expect(toast.error).toHaveBeenCalledWith(
      '음성을 이해하지 못했어요. 더 또렷하게 다시 녹음해 주세요.',
    );
  });
});
