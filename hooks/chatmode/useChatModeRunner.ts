import { MutableRefObject, useContext } from 'react';

import { useDirectMode } from '@/hooks/chatmode/useDirectMode';

import { ChatModeRunner, Conversation } from '@/types/chat';
import { ChatMode } from '@/types/chatmode';

import HomeContext from '@/pages/api/home/home.context';

export const useChatModeRunner = (conversations: Conversation[]) => {
  const {
    state: { stopConversationRef },
  } = useContext(HomeContext);
  const directMode = useDirectMode(conversations, stopConversationRef);
  return (plugin: ChatMode | null): ChatModeRunner => {
      return directMode;
  }
};
