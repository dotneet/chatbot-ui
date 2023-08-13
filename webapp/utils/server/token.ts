import { OPENAI_API_HOST, TEST_APIKEY } from '@/utils/app/const';

import { LocalAIModelID } from '@/types/openai';
import { TokenResponse } from '@/types/tokens';

export const getTokenCountResponse = async (
  model: LocalAIModelID,
  prompt: string,
  accessToken: string,
  max_new_tokens: number,
): Promise<TokenResponse> => {
  if (accessToken === TEST_APIKEY) {
    return {
      fits: true,
      tokenCount: 1066,
      contextLength: 2048,
    } as TokenResponse;
  }

  let url = `${OPENAI_API_HOST}/v1/token_check`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      prompts: [
        {
          model: model,
          prompt: prompt,
          max_tokens: max_new_tokens, // maximum number of tokens for response
        },
      ],
    }),
  });
  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  } else if (response.status !== 200) {
    throw new Error(
      `OpenAI API returned an error ${
        response.status
      }: ${await response.text()}`,
    );
  }

  const json = await response.json();

  const tokenCount = json.prompts[0] as TokenResponse;
  return tokenCount;
};
