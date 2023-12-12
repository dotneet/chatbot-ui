export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID_EMBEDDINGS =
  process.env.AZURE_DEPLOYMENT_ID_EMBEDDINGS || '';

export const AZURE_DEPLOYMENT_ID = process.env.AZURE_DEPLOYMENT_ID || '';

export const MONGODB_DB = process.env.MONGODB_DB || '';

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || '';

export const PROMPT_SHARING_ENABLED: boolean =
  process.env.PROMPT_SHARING_ENABLED === 'true' || false;

export const DEFAULT_USER_LIMIT_USD_MONTHLY: number =
  process.env.DEFAULT_USER_LIMIT_USD_MONTHLY != undefined
    ? Number.parseFloat(process.env.DEFAULT_USER_LIMIT_USD_MONTHLY)
    : -1;
