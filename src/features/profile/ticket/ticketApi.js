import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client } from '@/shared/api/client';

const unwrap = (res) => res?.data ?? res;

export const fetchTickets = () => client.get('/api/v1/tickets').then(unwrap);

export function useTicketsQuery() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  });
}

export const fetchPeriodCheck = (startDate, endDate) =>
  client.get('/api/v1/tickets/period-check', { params: { startDate, endDate } }).then(unwrap);

const createTicket = (body) => client.post('/api/v1/tickets', body);

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
