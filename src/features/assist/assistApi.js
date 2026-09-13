import { useMutation } from '@tanstack/react-query';
import { client } from '@/shared/api/client';

const unwrap = (response) => response?.data ?? response;

const createChatSession = () => client.post('/api/v1/chat/sessions').then(unwrap);

export const sendChatQuery = ({ sessionId, message, language = 'ko' }) =>
  client.post('/api/v1/chat/query', { sessionId, message, language }).then(unwrap);

export const sendChatAudioQuery = ({ sessionId, audio, language = 'ko' }) => {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('language', language);
  formData.append('audio', audio, audio.name || 'recording.webm');

  return client.post('/api/v1/chat/query/audio', formData).then(unwrap);
};

export function useCreateChatSessionMutation() {
  return useMutation({ mutationFn: createChatSession });
}

export function useSendChatQueryMutation() {
  return useMutation({ mutationFn: sendChatQuery });
}

export function useSendChatAudioQueryMutation() {
  return useMutation({ mutationFn: sendChatAudioQuery });
}
