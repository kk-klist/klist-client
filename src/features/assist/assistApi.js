import { useMutation } from '@tanstack/react-query';
import { client } from '@/shared/api/client';

const unwrap = (response) => response?.data ?? response;

const createChatSession = () => client.post('/api/v1/chat/sessions').then(unwrap);

const sendChatQuery = ({ sessionId, message }) =>
  client.post('/api/v1/chat/query', { sessionId, message }).then(unwrap);

export function useCreateChatSessionMutation() {
  return useMutation({ mutationFn: createChatSession });
}

export function useSendChatQueryMutation() {
  return useMutation({ mutationFn: sendChatQuery });
}
