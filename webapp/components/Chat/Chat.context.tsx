import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { ChatInitialState } from './Chat.state';

export interface ChatContextProps {
  state: ChatInitialState;
  dispatch: Dispatch<ActionType<ChatInitialState>>;
}

const ChatContext = createContext<ChatContextProps>(undefined!);

export default ChatContext;
