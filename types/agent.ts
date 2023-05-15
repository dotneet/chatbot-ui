import { CodeInterpreterMetaSchema, Message } from './chat';
import { OpenAIModel } from './openai';

import { TaskExecutionContext } from '@/agent/plugins/executor';

export type Action = {
  type: 'action';
  thought: string;
  plugin: PluginSummary;
  pluginInput: string;
};
export type PythonPluginInput = { type: string; code: string };
export type AnswerMeta = PythonPluginInput;
export type Answer = {
  type: 'answer';
  answer: string;
  meta?: AnswerMeta;
};
export type ReactAgentResult = Action | Answer;

export interface PlanningResponse {
  taskId: string;
  result: ReactAgentResult;
}

export interface PluginResult {
  action: Action;
  result: string;
  meta?: AnswerMeta;
}

export interface PlanningRequest {
  taskId?: string;
  model: OpenAIModel;
  key?: string;
  messages: Message[];
  enabledToolNames: string[];
  pluginResults: PluginResult[];
}

export interface RunPluginRequest {
  taskId: string;
  model: OpenAIModel;
  input: string;
  action: Action;
  key?: string;
}

export interface ToolDefinitionApi {
  type: string;
  url: string;
  hasUserAuthentication: boolean;
}

export interface ToolAuth {
  type: string;
}

export type PythonInterpreterMeta = {
  type: 'python';
  code: string;
};

export type PluginExecutionResult = {
  output: string;
  meta?: PythonInterpreterMeta;
};

export interface Plugin {
  nameForHuman: string;
  nameForModel: string;
  descriptionForModel: string;
  descriptionForHuman: string;
  execute?: (
    context: TaskExecutionContext,
    action: Action,
  ) => Promise<string | PluginExecutionResult>;
  api?: ToolDefinitionApi;
  apiSpec?: string;
  auth?: ToolAuth;
  logoUrl?: string;
  contactEmail?: string;
  legalInfoUrl?: string;
  displayForUser: boolean;
}

export interface RemotePluginTool extends Plugin {
  api: ToolDefinitionApi;
  apiSpec: string;
  auth: ToolAuth;
}

export interface PluginSummary {
  nameForHuman: string;
  nameForModel: string;
  descriptionForModel: string;
  descriptionForHuman: string;
  displayForUser: boolean;
  logoUrl?: string;
}
