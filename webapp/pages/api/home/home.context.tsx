import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderType } from '@/types/folder';

import { HomeInitialState } from './home.state';

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleSelectConversation: (conversation: Conversation) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
