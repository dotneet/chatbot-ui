import { useEffect, useRef } from 'react';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { cleanConversationHistory } from '@/utils/app/clean';
import {
  DEFAULT_SYSTEM_PROMPT,
  OPENAI_API_TYPE,
  PROMPT_SHARING_ENABLED,
  SUPPORT_EMAIL,
} from '@/utils/app/const';
import { trpc } from '@/utils/trpc';

import { Conversation } from '@/types/chat';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';

import { HomeMain } from '@/components/Home/HomeMain';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import { v4 as uuidv4 } from 'uuid';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
  isAzureOpenAI: boolean;
  promptSharingEnabled: boolean;
  supportEmail: string;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
  isAzureOpenAI,
  supportEmail,
  promptSharingEnabled,
}: Props) => {
  const { t } = useTranslation('chat');
  const settingsQuery = trpc.settings.get.useQuery();
  const promptsQuery = trpc.prompts.list.useQuery();
  const foldersQuery = trpc.folders.list.useQuery();
  const conversationsQuery = trpc.conversations.list.useQuery(undefined, {
    enabled: false,
  });
  const publicPromptsQuery = trpc.publicPrompts.list.useQuery();
  const publicFoldersQuery = trpc.publicFolders.list.useQuery();

  const stopConversationRef = useRef<boolean>(false);
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState: {
      ...initialState,
      stopConversationRef: stopConversationRef,
      isAzureOpenAI,
      supportEmail,
      promptSharingEnabled: promptSharingEnabled,
    } as HomeInitialState,
  });

  const {
    state: {
      apiKey,
      settings,
      conversations,
      selectedConversation,
      prompts,
      models,
    },
    dispatch,
  } = contextValue;

  const modelsQuery = trpc.models.list.useQuery({ key: apiKey });

  useEffect(() => {
    if (modelsQuery.data)
      dispatch({ field: 'models', value: modelsQuery.data });
  }, [modelsQuery.data, dispatch]);

  useEffect(() => {
    if (modelsQuery.error) {
      dispatch({ field: 'modelError', value: modelsQuery.error });
    }
  }, [dispatch, modelsQuery.error]);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = async (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [dispatch, selectedConversation]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    conversationsQuery.refetch();
  }, []);

  useEffect(() => {
    if (settingsQuery.data) {
      dispatch({
        field: 'settings',
        value: settingsQuery.data,
      });
    }
  }, [dispatch, settingsQuery.data]);

  useEffect(() => {
    if (promptsQuery.data) {
      dispatch({ field: 'prompts', value: promptsQuery.data });
    }
  }, [dispatch, promptsQuery.data]);

  useEffect(() => {
    if (foldersQuery.data) {
      dispatch({ field: 'folders', value: foldersQuery.data });
    }
  }, [dispatch, foldersQuery.data]);

  useEffect(() => {
    if (promptSharingEnabled && publicPromptsQuery.data) {
      dispatch({ field: 'publicPrompts', value: publicPromptsQuery.data });
    }
  }, [dispatch, publicPromptsQuery.data, promptSharingEnabled]);

  useEffect(() => {
    if (promptSharingEnabled && publicFoldersQuery.data) {
      dispatch({ field: 'publicFolders', value: publicFoldersQuery.data });
    }
  }, [dispatch, publicFoldersQuery.data, promptSharingEnabled]);

  useEffect(() => {
    if (conversationsQuery.data) {
      let history = conversationsQuery.data;
      const cleanedConversationHistory: Conversation[] =
        cleanConversationHistory(history, {
          temperature: settings.defaultTemperature,
        });
      dispatch({ field: 'conversations', value: cleanedConversationHistory });

      const conversation: Conversation | undefined =
        cleanedConversationHistory.length > 0
          ? cleanedConversationHistory[0]
          : undefined;
      if (conversation && !selectedConversation) {
        dispatch({
          field: 'selectedConversation',
          value: conversation,
        });
      } else if (!conversation) {
        dispatch({
          field: 'selectedConversation',
          value: {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            model: models.find((m) => m.id == defaultModelId),
            prompt: DEFAULT_SYSTEM_PROMPT,
            temperature: settings.defaultTemperature,
            folderId: null,
          },
        });
      }
    }
  }, [
    dispatch,
    conversationsQuery.data,
    settings.defaultTemperature,
    t,
    defaultModelId,
    models,
  ]);

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }

    const chatModeKeys = localStorage.getItem('chatModeKeys');
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'chatModeKeys', value: [] });
      localStorage.removeItem('chatModeKeys');
    } else if (chatModeKeys) {
      dispatch({ field: 'chatModeKeys', value: chatModeKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
      dispatch({ field: 'showPromptbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleSelectConversation,
      }}
    >
      <Head>
        <title>OpenGPT</title>
        <meta name="description" content="OpenGPT | Free AI Chat UI" />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <HomeMain selectedConversation={selectedConversation} />
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      isAzureOpenAI: OPENAI_API_TYPE === 'azure',
      serverSidePluginKeysSet,
      supportEmail: SUPPORT_EMAIL,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
        'error',
      ])),
      promptSharingEnabled: PROMPT_SHARING_ENABLED,
    },
  };
};
