import { useContext, useRef } from 'react';

import useConversations from '@/hooks/useConversations';

import { Conversation } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import { Chat } from '../Chat/Chat';
import { Chatbar } from '../Chatbar/Chatbar';
import { Navbar } from '../Mobile/Navbar';
import Promptbar from '../Promptbar';

type HomeMainProps = {
  selectedConversation: Conversation;
};

export const HomeMain = ({ selectedConversation }: HomeMainProps) => {
  const {
    state: { settings },
  } = useContext(HomeContext);

  const [_, conversationsAction] = useConversations();
  return (
    <main
      className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${settings.theme}`}
    >
      <div className="fixed top-0 w-full sm:hidden">
        <Navbar
          selectedConversation={selectedConversation}
          onNewConversation={() => conversationsAction.add()}
        />
      </div>

      <div className="flex h-full w-full pt-[48px] sm:pt-0">
        <Chatbar />

        <div className="flex flex-1">
          <Chat />
        </div>

        <Promptbar />
      </div>
    </main>
  );
};
