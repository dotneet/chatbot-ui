import { useContext } from 'react';

import { exportData } from '@/utils/app/importExport';
import { trpc } from '@/utils/trpc';

import HomeContext from '@/pages/api/home/home.context';

export const useExporter = () => {
  const conversationsListQuery = trpc.conversations.list.useQuery(undefined, {
    enabled: false,
  });
  const foldersListQuery = trpc.folders.list.useQuery(undefined, {
    enabled: false,
  });
  const promptsListQuery = trpc.prompts.list.useQuery(undefined, {
    enabled: false,
  });
  const {
    state: { prompts },
  } = useContext(HomeContext);
  return {
    exportData: async () => {
      const conversationsResult = await conversationsListQuery.refetch();
      if (conversationsResult.isError) {
        throw conversationsResult.error;
      }
      const foldersResult = await foldersListQuery.refetch();
      if (foldersResult.isError) {
        throw foldersResult.error;
      }
      const promptsResult = await promptsListQuery.refetch();
      if (promptsResult.isError) {
        throw promptsResult.error;
      }
      await exportData(
        conversationsResult.data!,
        foldersResult.data!,
        promptsResult.data!,
      );
    },
  };
};
