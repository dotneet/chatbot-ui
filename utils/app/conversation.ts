import { Answer } from '@/types/agent';
import { Message } from '@/types/chat';

export function createConversationNameFromMessage(content: string): string {
  return content.length > 30 ? content.substring(0, 30) + '...' : content;
}

export function createMessageFromAnswer(answer: Answer): Message {
  if (!answer.meta) {
    return {
      role: 'assistant',
      content: answer.answer,
    };
  }
  if ((answer.meta.type = 'plugin-execution')) {
    return {
      role: 'assistant',
      content: answer.answer,
      meta: {
        type: 'code',
        code: answer.meta.code,
      },
    };
  }
  return {
    role: 'assistant',
    content: answer.answer,
  };
}
