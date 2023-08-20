import * as z from 'zod';

export const OpenAIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxLength: z.number(), // max length of a message.
});
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;

export enum OpenAIModelID {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_3_5_16K = 'gpt-3.5-turbo-16k',
  GPT_3_5_AZ = 'gpt-35-turbo',
  GPT_3_5_16K_AZ = 'gpt-35-turbo-16k',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
}

export enum LocalAIModelID {
  VICUNA_13B = 'vicuna-13b-hf',
  WIZARD_VICUNA_13B_8K = 'wizard-vicuna-13b-hf-8k',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = LocalAIModelID.WIZARD_VICUNA_13B_8K;

// maxLength is the max number of characters per message
export const OpenAIModels: Record<LocalAIModelID, OpenAIModel> = {
  [LocalAIModelID.VICUNA_13B]: {
    id: LocalAIModelID.VICUNA_13B,
    name: 'VICUNA_13B',
    maxLength: 12000,
  },
  [LocalAIModelID.WIZARD_VICUNA_13B_8K]: {
    id: LocalAIModelID.WIZARD_VICUNA_13B_8K,
    name: 'WIZARD_VICUNA_13B_8K',
    maxLength: 12000,
  },
};
