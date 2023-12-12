import { Plugin, PluginResult, ReactAgentResult } from '@/types/agent';

import { DebugCallbackHandler as ImportedDebugCallbackHandler, stripQuotes } from './agentUtil';
import { TaskExecutionContext } from './plugins/executor';
import { listToolsBySpecifiedPlugins } from './plugins/list';
import prompts from './prompts/agent';

import chalk from 'chalk';
import { CallbackManager, NewTokenIndices } from 'langchain/callbacks';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAI } from 'openai';
import { getOpenAIApi } from '@/utils/server/openai';
import { OpenAIError } from '@/utils/server';
import { saveLlmUsage } from '@/utils/server/llmUsage';
import { BaseCallbackHandler } from 'langchain/callbacks';
import { SerializedFields } from '@langchain/core/dist/load/map_keys';
import { HandleLLMNewTokenCallbackFields } from 'langchain/dist/callbacks/base';
import { Document } from 'langchain/dist/document';
import { Serialized, SerializedNotImplemented } from 'langchain/dist/load/serializable';
import { LLMResult, BaseMessage, ChainValues, AgentAction, AgentFinish } from 'langchain/dist/schema';

class DebugCallbackHandler implements BaseCallbackHandler {
  lc_serializable: boolean = false;
  get lc_namespace(): ["langchain_core", "callbacks", string] {
    throw new Error('Method not implemented.');
  }
  get lc_secrets(): { [key: string]: string; } | undefined {
    throw new Error('Method not implemented.');
  }
  get lc_attributes(): { [key: string]: string; } | undefined {
    throw new Error('Method not implemented.');
  }
  get lc_aliases(): { [key: string]: string; } | undefined {
    throw new Error('Method not implemented.');
  }
  get lc_id(): string[] {
    throw new Error('Method not implemented.');
  }
  lc_kwargs!: SerializedFields;
  name!: string;
  ignoreLLM!: boolean;
  ignoreChain!: boolean;
  ignoreAgent!: boolean;
  ignoreRetriever!: boolean;
  awaitHandlers!: boolean;
  copy(): BaseCallbackHandler {
    throw new Error('Method not implemented.');
  }
  toJSON(): Serialized {
    throw new Error('Method not implemented.');
  }
  toJSONNotImplemented(): SerializedNotImplemented {
    throw new Error('Method not implemented.');
  }
  handleLLMNewToken?(token: string, idx: NewTokenIndices, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, fields?: HandleLLMNewTokenCallbackFields | undefined) {
    throw new Error('Method not implemented.');
  }
  handleLLMError?(err: any, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    throw new Error('Method not implemented.');
  }
  handleLLMEnd?(output: LLMResult, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    throw new Error('Method not implemented.');
  }
  handleChatModelStart?(llm: Serialized, messages: BaseMessage[][], runId: string, parentRunId?: string | undefined, extraParams?: Record<string, unknown> | undefined, tags?: string[] | undefined, metadata?: Record<string, unknown> | undefined, name?: string | undefined) {
    throw new Error('Method not implemented.');
  }
  handleChainStart?(chain: Serialized, inputs: ChainValues, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, metadata?: Record<string, unknown> | undefined, runType?: string | undefined, name?: string | undefined) {
    throw new Error('Method not implemented.');
  }
  handleChainError?(err: any, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, kwargs?: { inputs?: Record<string, unknown> | undefined; } | undefined) {
    throw new Error('Method not implemented.');
  }
  handleChainEnd?(outputs: ChainValues, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, kwargs?: { inputs?: Record<string, unknown> | undefined; } | undefined) {
    throw new Error('Method not implemented.');
  }
  handleToolStart?(tool: Serialized, input: string, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, metadata?: Record<string, unknown> | undefined, name?: string | undefined) {
    throw new Error('Method not implemented.');
  }
  handleToolError?(err: any, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    throw new Error('Method not implemented.');
  }
  handleToolEnd?(output: string, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    throw new Error('Method not implemented.');
  }
  handleText?(text: string, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  handleAgentAction?(action: AgentAction, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  handleAgentEnd?(action: AgentFinish, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  handleRetrieverStart?(retriever: Serialized, query: string, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined, metadata?: Record<string, unknown> | undefined, name?: string | undefined) {
    throw new Error('Method not implemented.');
  }
  handleRetrieverEnd?(documents: Document<Record<string, any>>[], runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    throw new Error('Method not implemented.');
  }
  handleRetrieverError?(err: any, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    throw new Error('Method not implemented.');
  }
  handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>,
    tags?: string[],
    metadata?: Record<string, unknown>,
    name?: string
  ): any {
    // implementation goes here
  }

  // implement other required methods here
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
  userPrompt: PromptTemplate;
} => {
  const sytemPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    prompts.systemPrefix +
      '\n\n' +
      prompts.systemPrompt +
      '\n\n' +
      prompts.systemSuffix,
  );

  const userPrompt: PromptTemplate = PromptTemplate.fromTemplate(
    prompts.userPrompt,
  );
  return { sytemPrompt, userPrompt };
};

const createAgentScratchpad = (pluginResults: PluginResult[]): string => {
  let agentScratchpad = '';
  if (pluginResults.length > 0) {
    agentScratchpad += `This was your previous work (but I haven't seen any of it! I only see what you return as final answer):\n`;
    for (const actionResult of pluginResults) {
      let observation = actionResult.result;
      if (observation.split('\n').length > 5) {
        observation = `"""\n${observation}\n"""`;
      }
      agentScratchpad += `Thought: ${actionResult.action.thought}
Action: ${actionResult.action.plugin.nameForModel}
Action Input: ${actionResult.action.pluginInput}
Observation: ${observation}\n`;
    }
  }
  agentScratchpad += '';
  return agentScratchpad;
};

const createFormattedPrompts = async (
  sytemPrompt: PromptTemplate,
  context: TaskExecutionContext,
  toolDescriptions: string,
  toolNames: string,
  userPrompt: PromptTemplate,
  input: string,
  agentScratchpad: string,
): Promise<{ systemContent: string; userContent: string }> => {
  const systemContent = await sytemPrompt.format({
    locale: context.locale,
    tool_descriptions: toolDescriptions,
    tool_names: toolNames,
  });
  const userContent = await userPrompt.format({
    input,
    agent_scratchpad: agentScratchpad,
  });
  return { systemContent, userContent };
};

const createMessages = async (
  context: TaskExecutionContext,
  tools: Plugin[],
  pluginResults: PluginResult[],
  input: string
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> => {
  const { sytemPrompt, userPrompt } = createPrompts();
  const agentScratchpad = createAgentScratchpad(pluginResults);
  const toolDescriptions = tools
    .map((tool) => tool.nameForModel + ': ' + tool.descriptionForModel)
    .join('\n');
  const toolNames = tools.map((tool) => tool.nameForModel).join(', ');
  const { systemContent, userContent } = await createFormattedPrompts(
    sytemPrompt,
    context,
    toolDescriptions,
    toolNames,
    userPrompt,
    input,
    agentScratchpad,
  );

  return [
    {
      role: 'system',
      content: systemContent,
    },
    {
      role: 'user',
      content: userContent,
    },
  ];
};

const logVerboseRequest = (messages: OpenAI.Chat.ChatCompletionMessageParam[]): void => {
  console.log(chalk.greenBright('LLM Request:'));
  for (const message of messages) {
    console.log(chalk.blue(message.role + ': ') + message.content);
  }
  console.log('');
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

export const executeNotConversationalReactAgent = async (
  context: TaskExecutionContext,
  enabledToolNames: string[],
  input: string,
  pluginResults: PluginResult[],
  verbose: boolean = false,
): Promise<ReactAgentResult> => {
  setupCallbackManager(verbose);
  const tools = await listToolsBySpecifiedPlugins(context, enabledToolNames);
  const openai = getOpenAIApi(context.model.azureDeploymentId);
  const messages = await createMessages(context, tools, pluginResults, input);

  const start = Date.now();
  if (verbose) {
    logVerboseRequest(messages);
  }
  let result;
  try {
    result = await openai.chat.completions.create({
      model: context.model.id,
      messages,
      temperature: 0.0,
      stop: ['\nObservation:'],
    });
  } catch (error: any) {
    if (error.response) {
      const { message, type, param, code } = error.response.data.error;
      throw new OpenAIError(message, type, param, code)
    } else throw error
  }

  await saveLlmUsage(context.userId, context.model.id, "agent", {
    prompt: result.usage!.prompt_tokens,
    completion: result.usage!.completion_tokens,
    total: result.usage!.total_tokens
  })

  const responseText = result.choices[0].message?.content;
  const ellapsed = Date.now() - start;
  if (verbose) {
    logVerboseResponse(ellapsed, responseText ?? undefined);
  }
  const output = parseResult(tools, responseText!);
  return output;
};

export const parseResult = (
  tools: Plugin[],
  result: string,
): ReactAgentResult => {
  const matchAnswer = result.match(/Final Answer:([\s\S]*)/);
  let answer = matchAnswer ? matchAnswer[1].trim() : '';
  answer =
    answer.indexOf('Positivity:') !== -1
      ? answer.slice(0, answer.indexOf('Positivity:')).trim()
      : answer;
  const answerResult: ReactAgentResult = {
    type: 'answer',
    answer: answer,
  };

  // if the positivity is high enough, return the answer
  const matchPositivity = result.match(/\nPositivity:(.*)/);
  if (matchPositivity && parseFloat(matchPositivity[1].trim()) >= 9) {
    if (answer) {
      return answerResult;
    }
  }

  const matchThought = result.match(/Thought:(.*)(\n|$)/);
  let thought = '';
  if (matchThought) {
    thought = matchThought[1].trim() || '';
  }
  const matchAction = result.match(/Action:(.*)(\n|$)/);
  let action = '';
  if (thought && matchAction) {
    const actionStr = matchAction[1];
    action = stripQuotes(actionStr.trim());
  }
  if (thought && action && action.indexOf('None') === -1) {
    const tool = tools.find((t) => t.nameForModel === action);
    if (!tool) {
      const error = new Error(`Tool ${action} not found`);
      if (answer) {
        // return the answer if already has for better experience.
        return answerResult;
      } else {
        throw error;
      }
    }
    const matchActionInput = result.match(/Action Input: (.*)(\n|$)/);
    const toolInputStr = matchActionInput
      ? (matchActionInput[1] as string)
      : '';
    const toolInput = stripQuotes(toolInputStr.trim());
    return {
      type: 'action',
      thought: thought.trim(),
      plugin: {
        nameForModel: tool.nameForModel,
        nameForHuman: tool.nameForHuman,
        descriptionForHuman: tool.descriptionForHuman,
        descriptionForModel: tool.descriptionForModel,
        logoUrl: tool.logoUrl,
        displayForUser: tool.displayForUser,
      },
      pluginInput: toolInput,
    };
  }
  return answerResult;
};
