import { useCallback, useContext } from 'react';

import { trpc } from '@/utils/trpc';

import { Conversation } from '@/types/chat';
import { FolderInterface, FolderType } from '@/types/folder';
import { Prompt } from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';

import { v4 as uuidv4 } from 'uuid';

type FoldersAction = {
  update: (newState: FolderInterface) => Promise<FolderInterface[]>;
  updateAll: (newState: FolderInterface[]) => Promise<FolderInterface[]>;
  add: (name: string, type: FolderType) => Promise<FolderInterface[]>;
  remove: (folderId: string) => Promise<FolderInterface[]>;
  clear: () => Promise<FolderInterface[]>;
};

export default function useFolders(): [FolderInterface[], FoldersAction] {
  const promptsUpdateAll = trpc.prompts.updateAll.useMutation();
  const conversationUpdateAll = trpc.conversations.updateAll.useMutation();
  const folderUpdateAll = trpc.folders.updateAll.useMutation();
  const folderUpdate = trpc.folders.update.useMutation();
  const folderRemove = trpc.folders.remove.useMutation();
  const folderRemoveAll = trpc.folders.removeAll.useMutation();
  const {
    state: { folders, conversations, prompts },
    dispatch,
  } = useContext(HomeContext);

  const updateAll = useCallback(
    async (updated: FolderInterface[]): Promise<FolderInterface[]> => {
      await folderUpdateAll.mutateAsync(updated);
      dispatch({ field: 'folders', value: updated });
      return updated;
    },
    [dispatch, folderUpdateAll],
  );

  const add = useCallback(
    async (name: string, type: FolderType) => {
      const newFolder: FolderInterface = {
        id: uuidv4(),
        name,
        type,
      };
      const newState = [newFolder, ...folders];
      await folderUpdate.mutateAsync(newFolder);
      dispatch({ field: 'folders', value: newState });
      return newState;
    },
    [dispatch, folderUpdate, folders],
  );

  const update = useCallback(
    async (folder: FolderInterface) => {
      const newState = folders.map((f) => {
        if (f.id === folder.id) {
          return folder;
        }
        return f;
      });
      await folderUpdate.mutateAsync(folder);
      dispatch({ field: 'folders', value: newState });
      return newState;
    },
    [dispatch, folderUpdate, folders],
  );

  const clear = useCallback(async () => {
    const newState = folders.filter((f) => f.type !== 'chat');
    await folderRemoveAll.mutateAsync({ type: 'chat' });
    dispatch({ field: 'folders', value: newState });
    return newState;
  }, [dispatch, folderRemoveAll, folders]);

  const remove = useCallback(
    async (folderId: string) => {
      const newState = folders.filter((f) => f.id !== folderId);
      await folderRemove.mutateAsync({ id: folderId });
      dispatch({ field: 'folders', value: newState });

      const targetConversations: Conversation[] = [];
      const updatedConversations: Conversation[] = conversations.map((c) => {
        if (c.folderId === folderId) {
          targetConversations.push(c);
          return {
            ...c,
            folderId: null,
          };
        }
        return c;
      });
      await conversationUpdateAll.mutateAsync(targetConversations);
      dispatch({ field: 'conversations', value: updatedConversations });

      const updatedPrompts: Prompt[] = prompts.map((p) => {
        if (p.folderId === folderId) {
          return {
            ...p,
            folderId: null,
          };
        }

        return p;
      });

      await promptsUpdateAll.mutateAsync(updatedPrompts);
      dispatch({ field: 'prompts', value: updatedPrompts });
      return newState;
    },
    [
      conversationUpdateAll,
      conversations,
      dispatch,
      folderRemove,
      folders,
      prompts,
      promptsUpdateAll,
    ],
  );

  return [
    folders,
    {
      add,
      update,
      updateAll,
      remove,
      clear,
    },
  ];
}
