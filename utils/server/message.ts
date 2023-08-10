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
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const serializingMessages = [
      systemPromptMessage,
      ...messagesToSend,
      message,
    ];
    const serialized = serializeMessages(model.name, serializingMessages);
    let tokenLength = await getTokenCountResponse(model.id as LocalAIModelID, serialized, key)
    if (tokenLength.tokenCount + reservedForCompletion > model.tokenLimit) {
      break;
    }
    contentLength = tokenLength.tokenCount;
    messagesToSend = [message, ...messagesToSend];
  }
  const maxToken = model.tokenLimit - contentLength;
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
