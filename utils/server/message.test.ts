import {describe, expect, it} from 'vitest'
import {Message} from '@/types/chat';

import {createMessagesToSend} from './message';
import {OpenAIModel} from "@/types/openai";
import { TEST_APIKEY } from '../app/const';

describe('createMessagesToSend', () => {
  it('should create messages to send and return max token', async () => {
    const systemPrompt = 'Hello';
    const model: OpenAIModel = {
      id: 'gpt-3.5-turbo',
      name: 'gpt-3.5-turbo',
      maxLength: 4000,
    }
    const messages: Message[] = [
      {role: 'user', content: 'World'},
      {role: 'assistant', content: 'How are you?'},
      {role: 'user', content: 'Fine, thank you.'},
    ];

    const result = await createMessagesToSend(
      TEST_APIKEY,
      model,
      systemPrompt,
      100,
      messages,
    );

    expect(result.messages[0]).toEqual({role: 'user', content: 'World'});
    expect(result.maxToken).toEqual(1066);
  });
})