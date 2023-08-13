import { IconExternalLink } from '@tabler/icons-react';
import { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import useConversations from '@/hooks/useConversations';

import { OpenAIModel } from '@/types/openai';

import HomeContext from '@/pages/api/home/home.context';
import { SystemPrompt } from './SystemPrompt';

interface Props {
  systemPrompt: string;
  onChangePrompt: (prompt: string) => void;
  showChangeSystemPromptButton: boolean;
}


export const ModelSelect = ({systemPrompt, onChangePrompt, showChangeSystemPromptButton}: Props) => {
  const { t } = useTranslation('chat');
  const [_, conversationsAction] = useConversations();
  const {
    state: { selectedConversation, models, defaultModelId, prompts },
  } = useContext(HomeContext);

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Model')}
      </label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t('Select a model') || ''}
          value={selectedConversation?.model?.id || defaultModelId}
          onChange={(e)=>{
            selectedConversation &&
            conversationsAction.updateValue(selectedConversation, {
              key: 'model',
              value: models.find(
                (model) => model.id === e.target.value,
              ) as OpenAIModel,
            });
          }}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.id === defaultModelId
                ? `Default (${model.name})`
                : model.name}
            </option>
          ))}
        </select>
      </div>
      <SystemPrompt
                          conversation={selectedConversation!}
                          systemPrompt={systemPrompt}
                          prompts={prompts}
                          onChangePrompt={onChangePrompt}
                        />
      {showChangeSystemPromptButton &&     
        <button 
          className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100 place-self-start" 
          onClick={(e)=>{
                selectedConversation && 
                conversationsAction.updateValue(selectedConversation, {
                  key: 'prompt',
                  value: systemPrompt,
                });   
                }}
        >
        Set system prompt
        </button>
      }
      <div className="w-full mt-3 text-left text-neutral-700 dark:text-neutral-400 flex items-center">
        <a
          href="https://platform.openai.com/account/usage"
          target="_blank"
          className="flex items-center"
        >
          <IconExternalLink size={18} className={'inline mr-1'} />
          {t('View Account Usage')}
        </a>
      </div>
    </div>
  );
};
