import { OpenAIModelSchema } from './openai';

import * as z from 'zod';

export const PromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  content: z.string(),
  model: OpenAIModelSchema,
  folderId: z.string().nullable(),
});

export const PromptSchemaArray = z.array(PromptSchema);

export type Prompt = z.infer<typeof PromptSchema>;
