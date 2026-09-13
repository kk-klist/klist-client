import { useRef, useState } from 'react';
import { ASSIST_LOCALE } from './assistLocale';
import { toast } from '@/shared/utils/toast';
import {
  useCreateChatSessionMutation,
  useSendChatAudioQueryMutation,
  useSendChatQueryMutation,
} from './assistApi';

const SESSION_ERROR_CODES = new Set(['CHAT_SESSION_NOT_FOUND', 'CHAT_SESSION_EXPIRED']);

function makeMessage(role, content, extra = {}) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    role,
    content,
    ...extra,
  };
}

function toAssistantMessage(response, text) {
  const status = response?.status ?? 'COMPLETED';
  const content =
    response?.answer ?? response?.message ?? response?.content ?? text.statusFallback[status];

  return makeMessage('assistant', content ?? text.answerFailed, {
    status,
    suggestions: Array.isArray(response?.suggestions) ? response.suggestions : [],
  });
}

export function useAssistChat() {
  const [language, setLanguage] = useState('ko');
  const text = ASSIST_LOCALE[language];
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
      STT_INVALID_RESPONSE: text.sttFailed,
      NETWORK_ERROR: text.networkFailed,
    }[error?.code];
    toast.error(error?.message ?? friendlyMessage ?? fallbackMessage);
  }

  async function startNewChat() {
    setSessionExpired(false);
    try {
      const session = await createSession.mutateAsync();
      const nextSessionId = session?.sessionId ?? session?.id;
      if (!nextSessionId) throw new Error(text.sessionMissing);
      setSessionId(nextSessionId);
      setMessages([]);
    } catch (error) {
      toast.error(error?.message ?? text.startFailed);
    }
  }

  async function sendMessage(message) {
    if (!sessionId || requestInFlightRef.current) return false;

    requestInFlightRef.current = true;
    setMessages((current) => [...current, makeMessage('user', message)]);
    try {
      const response = await sendQuery.mutateAsync({ sessionId, message, language });
      setMessages((current) => [...current, toAssistantMessage(response, text)]);
      return true;
    } catch (error) {
      handleQueryError(error, text.sendFailed);
      return false;
    } finally {
      requestInFlightRef.current = false;
    }
  }

  async function sendAudio(audio) {
    if (!sessionId || requestInFlightRef.current || !audio) return false;

    requestInFlightRef.current = true;
    try {
      const response = await sendAudioQuery.mutateAsync({ sessionId, audio, language });
      const transcription = response?.transcription?.trim();
      if (!transcription) {
        handleQueryError({ code: 'STT_INVALID_RESPONSE' }, text.sttFailed);
        return false;
      }
      setMessages((current) => [
        ...current,
        makeMessage('user', transcription),
        toAssistantMessage(response, text),
      ]);
      return true;
    } catch (error) {
      handleQueryError(error, text.audioFailed);
      return false;
    } finally {
      requestInFlightRef.current = false;
    }
  }

  return {
    language,
    setLanguage,
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
