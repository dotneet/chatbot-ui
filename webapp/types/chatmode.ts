import { KeyValuePair } from './data';

export interface ChatMode {
  id: ChatModeID;
  name: ChatModeName;
  requiredKeys: KeyValuePair[];
}

export interface ChatModeKey {
  chatModeId: ChatModeID;
  requiredKeys: KeyValuePair[];
}

export enum ChatModeID {
  DIRECT = 'direct',
}

export enum ChatModeName {
  DIRECT = 'Chat',
}

export const ChatModes: Record<ChatModeID, ChatMode> = {
  [ChatModeID.DIRECT]: {
    id: ChatModeID.DIRECT,
    name: ChatModeName.DIRECT,
    requiredKeys: [],
  },
};

export const ChatModeList = Object.values(ChatModes);
