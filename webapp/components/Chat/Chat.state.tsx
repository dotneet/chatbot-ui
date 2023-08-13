import { ChatMode, ChatModes } from '@/types/chatmode';

export interface ChatInitialState {
  chatMode: ChatMode;
}

export const initialState: ChatInitialState = {
  chatMode: ChatModes.direct,
};
