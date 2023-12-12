import OpenAI from 'openai';
import { saveLlmUsage } from './llmUsage';
import { OpenAIModelID, OpenAIModels } from '@/types/openai';
export const createEmbedding = async (
  text: string,
  openai: OpenAI,
  userId: string,
): Promise<number[]> => {
  const modelId = OpenAIModels[OpenAIModelID.TEXT_EMBEDDING_ADA_002].id;
  const result = await openai.embeddings.create({
    model: modelId,
    input: text,
  });
  await saveLlmUsage(userId, modelId, "embedding", {
    prompt: result.usage?.prompt_tokens,
    completion: 0,
    total: result.usage?.total_tokens
  })
  return result.data[0].embedding;
};

export function calcCosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((acc, v, i) => acc + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
  const normB = Math.sqrt(b.reduce((acc, v) => acc + v * v, 0));
  return dot / (normA * normB);
}
