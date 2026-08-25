import { useState } from 'react';
import { toast } from '@/shared/utils/toast';
import { useCreateChatSessionMutation, useSendChatQueryMutation } from './assistApi';

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
  const createSession = useCreateChatSessionMutation();
  const sendQuery = useSendChatQueryMutation();

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
    if (!sessionId || sendQuery.isPending) return false;

    setMessages((current) => [...current, makeMessage('user', message)]);
    try {
      const response = await sendQuery.mutateAsync({ sessionId, message });
      setMessages((current) => [...current, toAssistantMessage(response)]);
      return true;
    } catch (error) {
      if (SESSION_ERROR_CODES.has(error?.code)) {
        setSessionExpired(true);
      } else {
        toast.error(error?.message ?? '질문 전송에 실패했습니다.');
      }
      return false;
    }
  }

  return {
    sessionId,
    messages,
    sessionExpired,
    isCreating: createSession.isPending,
    createError: createSession.error,
    isWaiting: sendQuery.isPending,
    startNewChat,
    sendMessage,
  };
}
