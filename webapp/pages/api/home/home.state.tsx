import { MutableRefObject } from 'react';

import { Conversation, Message } from '@/types/chat';
import { ChatModeKey } from '@/types/chatmode';
import { FolderInterface } from '@/types/folder';
import { LocalAIModelID, OpenAIModel } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { Settings } from '@/types/settings';

export interface HomeInitialState {
  apiKey: string;
  chatModeKeys: ChatModeKey[];
  loading: boolean;
  settings: Settings;
  messageIsStreaming: boolean;
  modelError: Error | null;
  models: OpenAIModel[];
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  showChatbar: boolean;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: LocalAIModelID | undefined;
  stopConversationRef: MutableRefObject<boolean>;
}

export const initialState: Partial<HomeInitialState> = {
  apiKey: '',
  loading: false,
  chatModeKeys: [],
  settings: {
    userId: '',
    theme: 'dark',
    defaultTemperature: 1.0,
  },
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  showPromptbar: true,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: undefined,
};
