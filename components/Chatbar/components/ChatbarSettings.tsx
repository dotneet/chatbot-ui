import {
  IconFileExport,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { SettingDialog } from '@/components/Settings/SettingDialog';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ChatModeKeys } from './ChatModeKeys';
import { ClearConversations } from './ClearConversations';

import Image from 'next/image';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);

  const {
    state: {
      apiKey,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
    },
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  return (
    <div>
      <a href="https://amigoapp.ai" target='_blank'>
        <div className="flex items-center justify-center p-2 bg-gray-600 rounded-lg">
          <Image
            src="/amigo-logo.png"
            alt="AmigoAI"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3 text-xl font-bold p-2">AmigoAI</div>
        </div>
      </a>
      <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
        {conversations.length > 0 ? (
          <ClearConversations onClearConversations={handleClearConversations} />
        ) : null}

        <Import onImport={handleImportConversations} />

        <SidebarButton
          text={t('Export data')}
          icon={<IconFileExport size={18} />}
          onClick={() => handleExportData()}
        />

        <SidebarButton
          text={t('Settings')}
          icon={<IconSettings size={18} />}
          onClick={() => setIsSettingDialog(true)}
        />

        {!serverSideApiKeyIsSet ? (
          <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        ) : null}

        {!serverSidePluginKeysSet ? <ChatModeKeys /> : null}

        <SettingDialog
          open={isSettingDialogOpen}
          onClose={() => {
            setIsSettingDialog(false);
          }}
        />
      </div>
    </div>
  );
};
