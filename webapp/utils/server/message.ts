import { Message } from '@/types/chat';
import { LocalAIModelID, OpenAIModel } from '@/types/openai';

import { getTokenCountResponse } from './token';

export const createMessagesToSend = async (
  key: string,
  model: OpenAIModel,
  systemPrompt: string,
  reservedForCompletion: number,
  messages: Message[],
): Promise<{ messages: Message[]; maxToken: number }> => {
  let messagesToSend: Message[] = [];
  const systemPromptMessage: Message = {
    role: 'system',
    content: systemPrompt,
  };

  let contentLength: number = 0;
  let contextLength: number = 2048; // by default 2048 context length

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const serializingMessages = [
      systemPromptMessage,
      ...messagesToSend,
      message,
    ];
    const serialized = serializeMessages(model.name, serializingMessages);
    let tokenCountResponse = await getTokenCountResponse(model.id as LocalAIModelID, serialized, key, reservedForCompletion)
    contextLength = tokenCountResponse.contextLength
    if (tokenCountResponse.tokenCount + reservedForCompletion > tokenCountResponse.contextLength) {
      break;
    }
    contentLength = tokenCountResponse.tokenCount;
    messagesToSend = [message, ...messagesToSend];
  }
  const maxToken = contextLength - contentLength;
  return { messages: messagesToSend, maxToken };
};

export function serializeMessages(model: string, messages: Message[]): string {
  const msgSep = '\n';
  return [
    messages
      .map(({ role, content }) => {
        return `${role}: ${content}`;
      })
      .join(msgSep),
  ].join(msgSep);
}
