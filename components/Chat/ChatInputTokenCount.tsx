import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { trpc } from '@/utils/trpc';
import { LocalAIModelID } from '@/types/openai';
import useConversations from '@/hooks/useConversations';

export function ChatInputTokenCount(props: { content: string | undefined }) {
  const { t } = useTranslation('chat');
  const [_, conversationsAction] = useConversations();

  const {
    state: { selectedConversation },
  } = useContext(HomeContext);

  const tokenCount = trpc.tokens.count.useQuery({
    model: selectedConversation?.model.id as LocalAIModelID,
    prompt: props.content!
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
