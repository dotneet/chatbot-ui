import { SetStateAction, useContext } from 'react';

import { useTranslation } from 'next-i18next';

import useConversations from '@/hooks/useConversations';

import { OpenAIModel } from '@/types/openai';

import HomeContext from '@/pages/api/home/home.context';

import { SystemPrompt } from './SystemPrompt';
import { TemperatureSlider } from './Temperature';

interface Props {
  systemPrompt: string;
  onChangePrompt: (prompt: string) => void;
  showChangeSystemPromptButton: boolean;
  setTemperature: (value: SetStateAction<number>) => void;
}

export const ModelSelect = ({
  systemPrompt,
  onChangePrompt,
  showChangeSystemPromptButton,
  setTemperature,
}: Props) => {
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
      <div className="mb-2 w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t('Select a model') || ''}
          value={selectedConversation?.model?.id || defaultModelId}
          onChange={(e) => {
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
      {showChangeSystemPromptButton && (
        <button
          className="mt-2 min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100 place-self-start outline outline-1 rounded"
          onClick={(e) => {
            selectedConversation &&
              conversationsAction.updateValue(selectedConversation, {
                key: 'prompt',
                value: systemPrompt,
              });
          }}
        >
          Set system prompt
        </button>
      )}

      <label className="my-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Temperature')}
      </label>
      <TemperatureSlider
        onChangeTemperature={(temperature) => setTemperature(temperature)}
      />
    </div>
  );
};
