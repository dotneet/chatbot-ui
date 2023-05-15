import { NextApiRequest } from 'next';

import { extractHeaders } from '@/utils/server/http';
import { getTiktokenEncoding } from '@/utils/server/tiktoken';

import { Action, PluginExecutionResult } from '@/types/agent';
import { OpenAIModel } from '@/types/openai';

import { listAllTools } from './list';
import { Headers } from './requests';

import { Tiktoken } from '@dqbd/tiktoken';

export interface TaskExecutionContext {
  taskId: string;
  locale: string;
  headers: Headers;
  model?: OpenAIModel;
  getEncoding: () => Promise<Tiktoken>;
  withEncoding: (fn: (encoding: Tiktoken) => Promise<any>) => Promise<any>;
  verbose: boolean;
  apiKey?: string;
}

export const createContext = (
  taskId: string,
  request: Request | NextApiRequest,
  model: OpenAIModel,
  verbose: boolean,
  key?: string,
): TaskExecutionContext => {
  const headers = extractHeaders(request);
  const locale = headers['accept-language']?.split(',')[0] || 'en';
  return {
    taskId,
    headers,
    locale,
    model,
    verbose,
    apiKey: key || process.env.OPENAI_API_KEY,
    getEncoding: async (): Promise<Tiktoken> =>
      getTiktokenEncoding(model?.id || 'gpt-3.5-turbo'),
    withEncoding: async (
      fn: (encoding: Tiktoken) => Promise<any>,
    ): Promise<any> => {
      let enc: Tiktoken | null = null;
      try {
        enc = await getTiktokenEncoding(model?.id || 'gpt-3.5-turbo');
        return fn(enc);
      } finally {
        if (enc) {
          enc.free();
        }
      }
    },
  };
};

export const executeTool = async (
  context: TaskExecutionContext,
  action: Action,
): Promise<string | PluginExecutionResult> => {
  const tools = await listAllTools(context);
  const tool = tools.find(
    (tool) => tool.nameForModel === action.plugin.nameForModel,
  );
  if (!tool) {
    throw new Error(`Tool not found: ${action.plugin}`);
  }
  if (tool.execute) {
    return tool.execute(context, action);
  }
  throw new Error(`invalid tool: ${action.plugin}`);
};
