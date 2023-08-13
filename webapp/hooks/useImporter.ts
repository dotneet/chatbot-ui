import { cleanData } from '@/utils/app/importExport';
import { trpc } from '@/utils/trpc';

import { SupportedExportFormats } from '@/types/export';
import { Settings } from '@/types/settings';

export const useImporter = () => {
  const conversationsMutation = trpc.conversations.updateAll.useMutation();
  const foldersMutation = trpc.folders.updateAll.useMutation();
  const promptsMutation = trpc.prompts.updateAll.useMutation();

  return {
    importData: async (settings: Settings, data: SupportedExportFormats) => {
      const cleanedData = cleanData(data, {
        temperature: settings.defaultTemperature,
      });
      const { history, folders, prompts } = cleanedData;
      const conversations = history;
      await conversationsMutation.mutateAsync(conversations);
      await foldersMutation.mutateAsync(folders);
      await promptsMutation.mutateAsync(prompts);
      return cleanedData;
    },
  };
};
