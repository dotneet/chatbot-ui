import { serializeMessages } from '@/utils/server/message';

import { Message } from '@/types/chat';

import { Tiktoken } from 'tiktoken';
import chalk from 'chalk';
import { ConsoleCallbackHandler, Run } from 'langchain/callbacks';
import { LLMResult } from 'langchain/dist/schema';
import OpenAI from 'openai';
import { Serialized } from 'langchain/dist/load/serializable';

const strip = (str: string, c: string) => {
  const m = str.match(new RegExp(`^${c}(.*)${c}$`));
  if (m) {
    return m[1];
  }
  return str;
};

export const stripQuotes = (str: string) => {
  return strip(strip(str, '"'), "'");
};

export class DebugCallbackHandler extends ConsoleCallbackHandler {
  alwaysVerbose: boolean = true;
  llmStartTime: number = 0;
  async handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Map<any, any>,
    tags?: string[],
    metadata?: Map<any, any>,
    name?: string,
  ): Promise<Run> {
    this.llmStartTime = Date.now();
    console.log(chalk.greenBright('handleLLMStart ============'));
    console.log(prompts[0]);
    console.log('');
    return Promise.resolve({} as Run);
  }
  async handleLLMEnd(output: LLMResult, runId: string): Promise<Run> {
    const duration = Date.now() - this.llmStartTime;
    console.log(chalk.greenBright('handleLLMEnd =============='));
    console.log(`ellapsed: ${duration / 1000} sec.`);
    console.log(output.generations[0][0].text);
    console.log('');
    return Promise.resolve({} as Run);
  }
  async handleText(text: string): Promise<void> {
    console.log(chalk.greenBright('handleText =========='));
    console.log(text);
    console.log('');
  }
}

export const createAgentHistory = (
  encoding: Tiktoken,
  model: string,
  maxSize: number,
  messages: Message[],
): Message[] => {
  let result: Message[] = [];
  for (const msg of messages.reverse()) {
    const serialized = serializeMessages(model, [...result, msg]);
    const length = encoding.encode(serialized, 'all').length;
    if (length > maxSize) {
      break;
    }
    result.push(msg);
  }
  return result.reverse();
};

export const messagesToOpenAIMessages = (
  messages: Message[],
): OpenAI.Chat.ChatCompletionMessageParam[] => {
  return messages.map((msg) => {
    return {
      role: msg.role,
      content: msg.content,
    };
  });
};
