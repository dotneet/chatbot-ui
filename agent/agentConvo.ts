import { OpenAIError } from '@/utils/server';
import { saveLlmUsage } from '@/utils/server/llmUsage';
import { getOpenAIApi } from '@/utils/server/openai';

import { Plugin, PluginResult, ReactAgentResult } from '@/types/agent';
import { Message } from '@/types/chat';

import { createAgentHistory, messagesToOpenAIMessages } from './agentUtil';
import { TaskExecutionContext } from './plugins/executor';
import { listToolsBySpecifiedPlugins } from './plugins/list';
import prompts from './prompts/agentConvo';

import chalk from 'chalk';
import { CallbackManager } from 'langchain/callbacks';
import { BaseCallbackHandler } from 'langchain/callbacks';
import { PromptTemplate } from 'langchain/prompts';
import OpenAI from 'openai';

class DebugCallbackHandler extends BaseCallbackHandler {
  name!: string;
  // implementation of DebugCallbackHandler class
}

const setupCallbackManager = (verbose: boolean): void => {
  const callbackManager = new CallbackManager();
  if (verbose) {
    const handler = new DebugCallbackHandler();
    callbackManager.addHandler(handler);
  }
};

const createPrompts = (): {
  sytemPrompt: PromptTemplate;
  formatPrompt: PromptTemplate;
  userPrompt: PromptTemplate;
  toolResponsePrompt: PromptTemplate;
} => {
  const sytemPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    prompts.systemPrefix,
  );

  const formatPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    prompts.formatPrompt,
  );

  const userPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    prompts.toolsPrompt,
  );

  const toolResponsePrompt: PromptTemplate = PromptTemplate.fromTemplate(
    prompts.toolResponsePrompt,
  );
  return { sytemPrompt, formatPrompt, userPrompt, toolResponsePrompt };
};

const createToolResponse = async (
  pluginResults: PluginResult[],
  toolResponsePrompt: PromptTemplate,
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> => {
  let toolResponse: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (pluginResults.length > 0) {
    for (const actionResult of pluginResults) {
      const toolResponseContent = await toolResponsePrompt.format({
        observation: actionResult.result,
      });
      toolResponse.push({
        role: 'assistant',
        content: toolResponseContent,
      });
    }
  }
  return toolResponse;
};

const createFormattedPrompts = async (
  sytemPrompt: PromptTemplate,
  context: TaskExecutionContext,
  formatPrompt: PromptTemplate,
  toolNames: string,
  userPrompt: PromptTemplate,
  input: string,
  toolDescriptions: string,
  toolResponse: OpenAI.Chat.ChatCompletionMessageParam[],
): Promise<{ systemContent: string; userContent: string }> => {
  const systemContent = await sytemPrompt.format({
    locale: context.locale,
  });
  const formatInstuctions = await formatPrompt.format({
    tool_names: toolNames,
  });

  const userContent = await userPrompt.format({
    input,
    tools: toolDescriptions,
    format_instructions: formatInstuctions,
    agent_scratchpad: toolResponse,
  });
  return { systemContent, userContent };
};

const createMessages = async (
  context: TaskExecutionContext,
  tools: Plugin[],
  pluginResults: PluginResult[],
  history: Message[],
  modelId: string,
  input: string,
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> => {
  const { sytemPrompt, formatPrompt, userPrompt, toolResponsePrompt } =
    createPrompts();
  const toolResponse = await createToolResponse(
    pluginResults,
    toolResponsePrompt,
  );
  const toolDescriptions = tools
    .map((tool) => tool.nameForModel + ': ' + tool.descriptionForModel)
    .join('\n');
  const toolNames = tools.map((tool) => tool.nameForModel).join(', ');
  const { systemContent, userContent } = await createFormattedPrompts(
    sytemPrompt,
    context,
    formatPrompt,
    toolNames,
    userPrompt,
    input,
    toolDescriptions,
    toolResponse,
  );

  const encoding = await context.getEncoding();
  const agentHistory = messagesToOpenAIMessages(
    createAgentHistory(encoding, modelId, 500, history),
  );

  return [
    {
      role: 'system',
      content: systemContent,
    },
    ...agentHistory,
    {
      role: 'user',
      content: userContent,
    },
    ...toolResponse,
  ];
};

const logVerboseRequest = (
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
): void => {
  console.log(chalk.greenBright('LLM Request:'));
  for (const message of messages) {
    console.log(chalk.blue(message.role + ': ') + message.content);
  }
};

const logVerboseResponse = (
  ellapsed: number,
  responseText: string | undefined,
): void => {
  console.log(chalk.greenBright('LLM Response:'));
  console.log(`ellapsed: ${ellapsed / 1000} sec.`);
  console.log(responseText);
  console.log('');
};

export const executeReactAgent = async (
  context: TaskExecutionContext,
  enabledToolNames: string[],
  history: Message[],
  input: string,
  pluginResults: PluginResult[],
  verbose: boolean = false,
): Promise<ReactAgentResult> => {
  setupCallbackManager(verbose);
  const tools = await listToolsBySpecifiedPlugins(context, enabledToolNames);
  const modelId = context.model.id;
  const openai = getOpenAIApi(context.model.azureDeploymentId);

  const messages = await createMessages(
    context,
    tools,
    pluginResults,
    history,
    modelId,
    input,
  );

  const start = Date.now();
  if (verbose) {
    logVerboseRequest(messages);
  }
  let result;
  try {
    result = await openai.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.0,
      stop: ['\nObservation:'],
    });
  } catch (error: any) {
    if (error.response) {
      const { message, type, param, code } = error.response.data.error;
      throw new OpenAIError(message, type, param, code);
    } else throw error;
  }

  await saveLlmUsage(context.userId, context.model.id, 'agentConv', {
    prompt: result.usage!.prompt_tokens,
    completion: result.usage!.completion_tokens,
    total: result.usage!.total_tokens,
  });

  const responseText = result.choices[0].message?.content;
  const ellapsed = Date.now() - start;
  if (verbose) {
    logVerboseResponse(ellapsed, responseText || undefined);
  }
  const output = parseResult(tools, responseText!);
  return output;
};

export const parseResult = (
  tools: Plugin[],
  resultText: string,
): ReactAgentResult => {
  const trimmedText = resultText.trim();
  const regex = /```(\w+)?\s*(?<content>([\s\S]+?))\s*```/gm;
  const match = regex.exec(trimmedText);
  let json = '';
  if (match) {
    json = match.groups!.content;
  } else if (trimmedText[0] === '{') {
    json = trimmedText;
  }

  let result: { action: string; action_input: string } | null;
  try {
    result = JSON.parse(json);
  } catch (e) {
    console.log('Error parsing JSON', e);
    throw new Error('Error parsing JSON');
  }
  if (result === null) {
    throw new Error('Error parsing JSON');
  }

  if (result.action === 'Final Answer') {
    return {
      type: 'answer',
      answer: result.action_input,
    };
  }

  const tool = tools.find((tool) => tool.nameForModel === result!.action);
  if (!tool) {
    throw new Error(`Tool ${result.action} not found`);
  }

  let pluginInput = result.action_input;
  if (typeof pluginInput === 'object') {
    pluginInput = JSON.stringify(pluginInput);
  }

  return {
    type: 'action',
    plugin: tool,
    pluginInput,
    thought: '',
  };
};
