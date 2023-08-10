export interface ProcessEnv {
  OPENAI_API_KEY: string;
  OPENAI_API_HOST?: string;
  OPENAI_API_TYPE?: 'openai' | 'azure';
  OPENAI_API_VERSION?: string;
  OPENAI_ORGANIZATION?: string;
  NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT: string;
  MONGODB_URI: string;
  MONGODB_DB: string;
}
