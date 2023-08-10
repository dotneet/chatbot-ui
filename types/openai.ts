import * as z from 'zod';

export const OpenAIModelSchema = z.object({
  id: z.string(),
  azureDeploymentId: z.string().optional(),
  name: z.string(),
  maxLength: z.number(), // max length of a message.
  tokenLimit: z.number(),
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
  WIZARD_VICUNA_13B = 'wizard-vicuna-13b-hf',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = LocalAIModelID.WIZARD_VICUNA_13B;

// maxLength is the max number of characters per message
export const OpenAIModels: Record<LocalAIModelID, OpenAIModel> = {
  [LocalAIModelID.VICUNA_13B]: {
    id: LocalAIModelID.VICUNA_13B,
    name: 'VICUNA_13B',
    maxLength: 12000,
    tokenLimit: 2048
  },
  [LocalAIModelID.WIZARD_VICUNA_13B]: {
    id: LocalAIModelID.WIZARD_VICUNA_13B,
    name: 'WIZARD_VICUNA_13B',
    maxLength: 12000,
    tokenLimit: 2048
  },
};
