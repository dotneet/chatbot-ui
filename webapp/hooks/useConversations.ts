import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { trpc } from '@/utils/trpc';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { OpenAIModels } from '@/types/openai';

import HomeContext from '@/pages/api/home/home.context';

import { v4 as uuidv4 } from 'uuid';

type ConversationsAction = {
  update: (newState: Conversation) => Promise<Conversation>;
  updateValue: (
    conversation: Conversation,
    kv: KeyValuePair,
  ) => Promise<Conversation>;
  updateAll: (newState: Conversation[]) => Promise<Conversation[]>;
  add: () => Promise<Conversation[]>;
  clear: () => Promise<Conversation[]>;
  remove: (conversation: Conversation) => Promise<Conversation[]>;
};

export default function useConversations(): [
  Conversation[],
  ConversationsAction,
] {
  const { t } = useTranslation('chat');
  const { t: tErr } = useTranslation('error');
  const conversationUpdateAll = trpc.conversations.updateAll.useMutation();
  const conversationUpdate = trpc.conversations.update.useMutation();
  const conversationRemove = trpc.conversations.remove.useMutation();
  const conversationRemoveAll = trpc.conversations.removeAll.useMutation();
  const {
    state: { defaultModelId, conversations, selectedConversation, settings, models },
    dispatch,
  } = useContext(HomeContext);

  const updateAll = useCallback(
    async (updated: Conversation[]): Promise<Conversation[]> => {
      await conversationUpdateAll.mutateAsync(updated);
      dispatch({ field: 'conversations', value: updated });
      return updated;
    },
    [conversationUpdateAll, dispatch],
  );

  const add = useCallback(async () => {
    if (!defaultModelId) {
      throw new Error('No default model');
    }

    const lastConversation = conversations[conversations.length - 1];
    const newConversation: Conversation = {
      id: uuidv4(),
      name: `${t('New Conversation')}`,
      messages: [],
      model: lastConversation?.model || models.find(m => m.id == defaultModelId),
      prompt: t(DEFAULT_SYSTEM_PROMPT),
      temperature: settings.defaultTemperature,
      folderId: null,
    };

    await conversationUpdate.mutateAsync(newConversation);
    const newState = [newConversation, ...conversations];
    dispatch({ field: 'conversations', value: newState });

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'loading', value: false });
    return newState;
  }, [
    conversationUpdate,
    conversations,
    defaultModelId,
    dispatch,
    settings.defaultTemperature,
    t,
  ]);

  const update = useCallback(
    async (conversation: Conversation) => {
      const newConversations = conversations.map((f) => {
        if (f.id === conversation.id) {
          return conversation;
        }
        return f;
      });
      await conversationUpdate.mutateAsync(conversation);
      dispatch({ field: 'conversations', value: newConversations });
      if (selectedConversation?.id === conversation.id) {
        dispatch({ field: 'selectedConversation', value: conversation });
      }
      return conversation;
    },
    [conversationUpdate, conversations, dispatch, selectedConversation?.id],
  );

  const updateValue = useCallback(
    async (conversation: Conversation, kv: KeyValuePair) => {
      const updatedConversation = {
        ...conversation,
        [kv.key]: kv.value,
      };
      const newState = await update(updatedConversation);
      if (selectedConversation?.id === conversation.id) {
        dispatch({ field: 'selectedConversation', value: updatedConversation });
      }
      return newState;
    },
    [dispatch, selectedConversation?.id, update],
  );

  const remove = useCallback(
    async (conversation: Conversation) => {
      await conversationRemove.mutateAsync({ id: conversation.id });
      const updatedConversations = conversations.filter(
        (c) => c.id !== conversation.id,
      );
      dispatch({ field: 'conversations', value: updatedConversations });
      return updatedConversations;
    },
    [conversationRemove, conversations, dispatch],
  );

  const clear = useCallback(async () => {
    await conversationRemoveAll.mutateAsync();
    dispatch({ field: 'conversations', value: [] });
    return [];
  }, [conversationRemoveAll, dispatch]);

  return [
    conversations,
    {
      add,
      update,
      updateValue,
      updateAll,
      remove,
      clear,
    },
  ];
}
