import {
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '@/utils/app/const';

import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';

import { procedure, router } from '../trpc';

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const models = router({
  list: procedure
    .input(
      z.object({
        key: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const key = input.key;

      let url = `${OPENAI_API_HOST}/v1/models`;
      if (OPENAI_API_TYPE === 'azure') {
        url = `${OPENAI_API_HOST}/openai/models?api-version=${OPENAI_API_VERSION}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(OPENAI_API_TYPE === 'openai' && {
            Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
          }),
          ...(OPENAI_API_TYPE === 'azure' && {
            'api-key': `${key ? key : process.env.OPENAI_API_KEY}`,
          }),
          ...(OPENAI_API_TYPE === 'openai' &&
            OPENAI_ORGANIZATION && {
              'OpenAI-Organization': OPENAI_ORGANIZATION,
            }),
        },
      });

      if (response.status === 401) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
      } else if (response.status !== 200) {
        console.error(
          `OpenAI API returned an error ${
            response.status
          }: ${await response.text()}`,
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'OpenAI API returned an error',
        });
      }

      const json = await response.json();

      const models: OpenAIModel[] = json.data
        .map((model: any) => {
          for (const [key, value] of Object.entries(OpenAIModelID)) {
            const modelId = model.id;
            if (value === modelId) {
              const r: OpenAIModel = {
                id: modelId,
                azureDeploymentId:
                  OPENAI_API_TYPE === 'azure' ? model.id : undefined,
                name: OpenAIModels[value].name,
                maxLength: OpenAIModels[value].maxLength,
                tokenLimit: OpenAIModels[value].tokenLimit,
                type: OpenAIModels[value].type,
              };

              return r;
            }
          }
        })
        .filter(Boolean);
      if (OPENAI_API_TYPE === 'azure') {
        return models.filter(
          (modelId) =>
            modelId.azureDeploymentId === process.env.AZURE_DEPLOYMENT_ID,
        );
      }

      return models;
    }),
});
