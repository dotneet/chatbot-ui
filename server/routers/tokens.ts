import {
    OPENAI_API_HOST,
  } from '@/utils/app/const';
  
import { LocalAIModelID, OpenAIModels } from '@/types/openai';

import { procedure, router } from '../trpc';

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { TokenResponse } from '@/types/tokens';

  export const tokens = router({
    count: procedure
      .input(
        z.object({
          prompt: z.string(),
          model: z.nativeEnum(LocalAIModelID),
        })
      )
      .query(async ({ ctx, input }) => {
        const key = ctx.userToken;

        let url = `${OPENAI_API_HOST}/v1/token_check`;
  
        const response = await fetch(url, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            prompts: [
              {
                model: input.model,
                prompt: input.prompt,
                max_tokens: OpenAIModels[input.model].tokenLimit
              }
            ]
          })
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
        
        const tokenCount = json.prompts[0] as TokenResponse
        return tokenCount;
      }),
  });
  