import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { trpc } from '@/utils/trpc';
import { LocalAIModelID, fallbackModelID } from '@/types/openai';

export function ChatInputTokenCount(props: { content: string | undefined }) {
  const { t } = useTranslation('chat');
  const {
    state: { selectedConversation },
  } = useContext(HomeContext);

  let modelId = !!selectedConversation?.model ? selectedConversation.model.id as LocalAIModelID : fallbackModelID
  const tokenCount = trpc.tokens.count.useQuery({
    model: modelId,
    prompt: !!props.content ? props.content : ""
  })
  const count = tokenCount.data?.tokenCount;
  if (count == null) return null;
  return (
    <div className="py-1 px-2 text-neutral-400 pointer-events-auto text-xs">
      {t('{{count}} tokens', {
        count,
      })}
    </div>
  );
}
