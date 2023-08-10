import {
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '@/utils/app/const';

import { OpenAIModel, LocalAIModelID, OpenAIModels } from '@/types/openai';

import { procedure, router } from '../trpc';

import { TRPCError } from '@trpc/server';

export const models = router({
  list: procedure
    .query(async ({ ctx }) => {
      const key = ctx.userToken;

      let url = `${OPENAI_API_HOST}/v1/models`;
      if (OPENAI_API_TYPE === 'azure') {
        url = `${OPENAI_API_HOST}/openai/deployments?api-version=${OPENAI_API_VERSION}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
      });

      if (response.status === 401) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized error. Please contact IT/DP/DSE/DES2 team for access to the llm-inference-api endpoint' });
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
          for (const [key, value] of Object.entries(LocalAIModelID)) {
            const modelId = OPENAI_API_TYPE === 'azure' ? model.model : model.id;
            if (value === modelId) {
              const r: OpenAIModel = {
                id: modelId,
                azureDeploymentId: OPENAI_API_TYPE === 'azure' ? model.id : undefined,
                name: OpenAIModels[value].name,
                maxLength: OpenAIModels[value].maxLength,
                tokenLimit: OpenAIModels[value].tokenLimit,
              };
              return r;
            }
          }
        })
        .filter(Boolean);

      return models;
    }),
});
