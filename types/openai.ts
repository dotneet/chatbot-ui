import * as z from 'zod';

export enum OpenAIModelID {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_3_5_16K = 'gpt-3.5-turbo-16k',
  GPT_3_5_AZ = 'gpt-35-turbo',
  GPT_3_5_16K_AZ = 'gpt-35-turbo-16k',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_128K = 'gpt-4-1106-preview',
  TEXT_EMBEDDING_ADA_002 = 'text-embedding-ada-002',
}

export enum OpenAIModelType {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMDEDDING = 'embedding'
}

export const OpenAIModelSchema = z.object({
  id: z.nativeEnum(OpenAIModelID),
  azureDeploymentId: z.string().optional(),
  name: z.string(),
  maxLength: z.number(), // max length of a message.
  tokenLimit: z.number(),
  type: z.nativeEnum(OpenAIModelType).default(OpenAIModelType.CHAT)
});
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_3_5;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_3_5_16K]: {
    id: OpenAIModelID.GPT_3_5_16K,
    name: 'GPT-3.5-16K',
    maxLength: 48000,
    tokenLimit: 16000,
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_3_5_AZ]: {
    id: OpenAIModelID.GPT_3_5_AZ,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_3_5_16K_AZ]: {
    id: OpenAIModelID.GPT_3_5_16K_AZ,
    name: 'GPT-3.5-16K',
    maxLength: 48000,
    tokenLimit: 16000,
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: 'GPT-4',
    maxLength: 24000,
    tokenLimit: 8000,
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_4_32K]: {
    id: OpenAIModelID.GPT_4_32K,
    name: 'GPT-4-32K',
    maxLength: 96000,
    tokenLimit: 32000,
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_4_128K]: {
    id: OpenAIModelID.GPT_4_128K,
    name: 'GPT-4-128K',
    maxLength: 384000,
    tokenLimit: 128000,
    type: OpenAIModelType.CHAT,
  },
  [OpenAIModelID.TEXT_EMBEDDING_ADA_002]: {
    id: OpenAIModelID.TEXT_EMBEDDING_ADA_002,
    name: 'TEXT-EMBEDDING-ADA-002',
    maxLength: 24000,
    tokenLimit: 8000,
    type: OpenAIModelType.EMDEDDING
  },
};
