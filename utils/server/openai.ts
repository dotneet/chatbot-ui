import {
  AZURE_DEPLOYMENT_ID_EMBEDDINGS,
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
} from '../app/const';

import { OpenAI } from 'openai';

export const getOpenAIApi = (deploymentId?: string): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;

  let openaiConfig;
  if (OPENAI_API_TYPE == 'azure') {
    openaiConfig = {
      apiKey,
      baseURL: new URL(
        OPENAI_API_HOST + '/openai/models/' + deploymentId,
      ).toString(),
      defaultQuery: { 'api-version': OPENAI_API_VERSION },
      defaultHeaders: { 'api-key': apiKey },
    };
  } else {
    openaiConfig = {
      apiKey,
    };
  }
  return new OpenAI(openaiConfig);
};

export const getOpenAIApiEmbeddings = (): OpenAI => {
  return getOpenAIApi(AZURE_DEPLOYMENT_ID_EMBEDDINGS);
};
