export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const DEFAULT_MAX_NEW_TOKENS = 
  !!process.env.NEXT_PUBLIC_DEFAULT_MAX_NEW_TOKENS ? parseInt(process.env.NEXT_PUBLIC_DEFAULT_MAX_NEW_TOKENS, 10) :
  parseInt("1024", 10)

export const TEST_APIKEY = "your-test-token"

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const MONGODB_DB = process.env.MONGODB_DB || '';
