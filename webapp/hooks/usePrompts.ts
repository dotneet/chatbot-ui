import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '@/utils/trpc';

import { OpenAIModels } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';

import { v4 as uuidv4 } from 'uuid';

type PromptsAction = {
  update: (newState: Prompt) => Promise<Prompt[]>;
  updateAll: (newState: Prompt[]) => Promise<Prompt[]>;
  add: () => Promise<Prompt[]>;
  remove: (prompt: Prompt) => Promise<Prompt[]>;
};

export default function usePrompts(): [Prompt[], PromptsAction] {
  const { t: tErr } = useTranslation('error');
  const {
    state: { defaultModelId, prompts },
    dispatch,
  } = useContext(HomeContext);
  const promptsUpdateAll = trpc.prompts.updateAll.useMutation();
  const promptsUpdate = trpc.prompts.update.useMutation();
  const promptRemove = trpc.prompts.remove.useMutation();

  const updateAll = useCallback(
    async (updated: Prompt[]): Promise<Prompt[]> => {
      await promptsUpdateAll.mutateAsync(updated);
      dispatch({ field: 'prompts', value: updated });
      return updated;
    },
    [dispatch, promptsUpdateAll],
  );

  const add = useCallback(async () => {
    if (!defaultModelId) {
      const err = tErr('No Default Model');
      throw new Error(err);
    }
    const newPrompt: Prompt = {
      id: uuidv4(),
      name: `Prompt ${prompts.length + 1}`,
      description: '',
      content: '',
      model: OpenAIModels[defaultModelId],
      folderId: null,
    };
    await promptsUpdate.mutateAsync(newPrompt);
    const newState = [newPrompt, ...prompts];
    dispatch({ field: 'prompts', value: newState });
    return newState;
  }, [defaultModelId, dispatch, prompts, promptsUpdate, tErr]);

  const update = useCallback(
    async (prompt: Prompt) => {
      const newState = prompts.map((f) => {
        if (f.id === prompt.id) {
          return prompt;
        }
        return f;
      });
      await promptsUpdate.mutateAsync(prompt);
      dispatch({ field: 'prompts', value: newState });
      return newState;
    },
    [dispatch, prompts, promptsUpdate],
  );

  const remove = useCallback(
    async (prompt: Prompt) => {
      const newState = prompts.filter((f) => f.id !== prompt.id);
      await promptRemove.mutateAsync({ id: prompt.id });
      dispatch({ field: 'prompts', value: newState });
      return newState;
    },
    [dispatch, promptRemove, prompts],
  );

  return [
    prompts,
    {
      add,
      update,
      updateAll,
      remove,
    },
  ];
}
