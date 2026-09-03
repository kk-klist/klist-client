import { useRef, useState } from 'react';
import { toast } from '@/shared/utils/toast';
import {
  useCreateChatSessionMutation,
  useSendChatAudioQueryMutation,
  useSendChatQueryMutation,
} from './assistApi';

const SESSION_ERROR_CODES = new Set(['CHAT_SESSION_NOT_FOUND', 'CHAT_SESSION_EXPIRED']);

const STATUS_FALLBACK = {
  COMPLETED: '답변을 완료했어요.',
  NO_RESULT: '관련된 결과를 찾지 못했어요. 다른 방식으로 질문해 주세요.',
  UNSUPPORTED: '아직 답변하기 어려운 질문이에요.',
  CLARIFICATION_REQUIRED: '조금 더 구체적으로 알려주세요.',
};

function makeMessage(role, content, extra = {}) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    role,
    content,
    ...extra,
  };
}

function toAssistantMessage(response) {
  const status = response?.status ?? 'COMPLETED';
  const content =
    response?.answer ?? response?.message ?? response?.content ?? STATUS_FALLBACK[status];

  return makeMessage('assistant', content ?? '답변을 불러오지 못했어요.', {
    status,
    suggestions: Array.isArray(response?.suggestions) ? response.suggestions : [],
  });
}

export function useAssistChat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const requestInFlightRef = useRef(false);
  const createSession = useCreateChatSessionMutation();
  const sendQuery = useSendChatQueryMutation();
  const sendAudioQuery = useSendChatAudioQueryMutation();
  const isWaiting = sendQuery.isPending || sendAudioQuery.isPending;

  function handleQueryError(error, fallbackMessage) {
    if (SESSION_ERROR_CODES.has(error?.code)) {
      setSessionExpired(true);
      return;
    }

    const friendlyMessage = {
      STT_INVALID_RESPONSE:
        '음성을 이해하지 못했어요. 더 또렷하게 녹음하거나 다른 파일을 선택해 주세요.',
      NETWORK_ERROR: '음성 파일을 전송하지 못했어요. 네트워크 연결을 확인하고 다시 시도해 주세요.',
    }[error?.code];
    toast.error(friendlyMessage ?? error?.message ?? fallbackMessage);
  }

  async function startNewChat() {
    setSessionExpired(false);
    try {
      const session = await createSession.mutateAsync();
      const nextSessionId = session?.sessionId ?? session?.id;
      if (!nextSessionId) throw new Error('세션 ID가 응답에 없습니다.');
      setSessionId(nextSessionId);
      setMessages([]);
    } catch (error) {
      toast.error(error?.message ?? '대화를 시작하지 못했습니다.');
    }
  }

  async function sendMessage(message) {
    if (!sessionId || requestInFlightRef.current) return false;

    requestInFlightRef.current = true;
    setMessages((current) => [...current, makeMessage('user', message)]);
    try {
      const response = await sendQuery.mutateAsync({ sessionId, message });
      setMessages((current) => [...current, toAssistantMessage(response)]);
      return true;
    } catch (error) {
      handleQueryError(error, '질문 전송에 실패했습니다.');
      return false;
    } finally {
      requestInFlightRef.current = false;
    }
  }

  async function sendAudio(audio) {
    if (!sessionId || requestInFlightRef.current || !audio) return false;

    requestInFlightRef.current = true;
    try {
      const response = await sendAudioQuery.mutateAsync({ sessionId, audio });
      const transcription = response?.transcription?.trim();
      if (!transcription) {
        handleQueryError({ code: 'STT_INVALID_RESPONSE' }, '음성을 변환하지 못했습니다.');
        return false;
      }
      setMessages((current) => [
        ...current,
        makeMessage('user', transcription),
        toAssistantMessage(response),
      ]);
      return true;
    } catch (error) {
      handleQueryError(error, '음성 파일 처리에 실패했습니다.');
      return false;
    } finally {
      requestInFlightRef.current = false;
    }
  }

  return {
    sessionId,
    messages,
    sessionExpired,
    isCreating: createSession.isPending,
    createError: createSession.error,
    isWaiting,
    isTranscribing: sendAudioQuery.isPending,
    startNewChat,
    sendMessage,
    sendAudio,
  };
}
