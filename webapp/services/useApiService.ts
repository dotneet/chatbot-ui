import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';

import { ChatBody, Conversation, Message } from '@/types/chat';

const useApiService = () => {
  const fetchService = useFetch();

  const chat = useCallback(
    (
      params: { body: ChatBody; conversation: Conversation },
      signal?: AbortSignal,
    ) => {
      return fetchService.post<Message>(`/api/chat`, {
        body: params.body,
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
        rawResponse: true,
      });
    },
    [fetchService],
  );

  return {
    chat,
  };
};

export default useApiService;
