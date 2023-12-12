import { IconArrowDown, IconClearAll, IconSettings } from '@tabler/icons-react';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { useChatModeRunner } from '@/hooks/chatmode/useChatModeRunner';
import useConversations from '@/hooks/useConversations';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import useMesseageSender from '@/hooks/useMessageSender';

import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { throttle } from '@/utils/data/throttle';

import { Plugin } from '@/types/agent';
import { Message } from '@/types/chat';
import { ChatMode } from '@/types/chatmode';

import HomeContext from '@/pages/api/home/home.context';

import Spinner from '../Spinner';
import ChatContext from './Chat.context';
import { ChatInitialState, initialState } from './Chat.state';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { TemperatureSlider } from './Temperature';

export const Chat = memo(() => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      models,
      apiKey,
      chatModeKeys: chatModeKeys,
      serverSideApiKeyIsSet,
      modelError,
      loading,
      prompts,
      publicPrompts,
      settings,
    },
  } = useContext(HomeContext);

  const chatContextValue = useCreateReducer<ChatInitialState>({
    initialState,
  });

  const [conversations, conversationsAction] = useConversations();

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    t(DEFAULT_SYSTEM_PROMPT) || '',
  );
  const [temperature, setTemperature] = useState<number>(
    settings.defaultTemperature,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useMesseageSender();

  const handleSend = useCallback(
    async (
      message: Message,
      deleteCount = 0,
      chatMode: ChatMode | null = null,
      plugins: Plugin[],
    ) => {
      if (!selectedConversation) {
        return;
      }
      const conversation = selectedConversation;
      if (
        conversation.prompt !== systemPrompt ||
        conversation.temperature !== temperature
      ) {
        conversation.prompt = systemPrompt;
        conversation.temperature = temperature;
        await conversationsAction.update(conversation);
      }
      sendMessage(message, deleteCount, chatMode, plugins);
    },
    [
      selectedConversation,
      systemPrompt,
      temperature,
      sendMessage,
      conversationsAction,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm('Are you sure you want to clear all messages?') &&
      selectedConversation
    ) {
      conversationsAction.updateValue(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };

  useEffect(() => {
    setSystemPrompt(
      selectedConversation?.prompt ||
        t(DEFAULT_SYSTEM_PROMPT) ||
        DEFAULT_SYSTEM_PROMPT,
    );
    setTemperature(settings.defaultTemperature);
  }, [selectedConversation, settings.defaultTemperature, t]);

  const throttledScrollDown = throttle(scrollDown, 250);
  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <ChatContext.Provider value={{ ...chatContextValue }}>
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
        {!(apiKey || serverSideApiKeyIsSet) ? (
          <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
            <div className="text-center text-4xl font-bold text-black dark:text-white">
              Welcome to OpenGPT
            </div>
            <div className="text-center text-lg text-black dark:text-white">
              <div className="mb-8">{`OpenGPT source clone of OpenAI's ChatGPT UI.`}</div>
              <div className="mb-2 font-bold">
                Important: OpenGPT is 100% unaffiliated with OpenAI.
              </div>
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">
                OpenGPT allows you to safely use your OpenAI API Key and pay as you go.
              </div>
              <div className="mb-2">
                It is <span className="italic">only</span> used to communicate with their API.
              </div>
              <div className="mb-2">
                {t(
                  'Please set your OpenAI API key in the bottom left of the sidebar.',
                )}
              </div>
              <div>
                {t(
                  "If you don't have an OpenAI API key, you can get one here: ",
                )}
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  openai.com
                </a>
              </div>
            </div>
          </div>
        ) : modelError ? (
          <ErrorMessageDiv error={modelError} />
        ) : (
          <>
            <div
              className="max-h-full overflow-x-hidden"
              ref={chatContainerRef}
              onScroll={handleScroll}
            >
              {selectedConversation?.messages.length === 0 ? (
                <>
                  <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                    <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                      {models.length === 0 ? (
                        <div>
                          <Spinner size="16px" className="mx-auto" />
                        </div>
                      ) : (
                        'Chatbot UI'
                      )}
                    </div>

                    {models.length > 0 && (
                      <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                        <ModelSelect />

                        <SystemPrompt
                          conversation={selectedConversation}
                          systemPrompt={systemPrompt}
                          prompts={prompts}
                          publicPrompts={publicPrompts}
                          onChangePrompt={(prompt) => setSystemPrompt(prompt)}
                        />

                        <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
                          {t('Temperature')}
                        </label>

                        <TemperatureSlider
                          onChangeTemperature={(temperature) =>
                            setTemperature(temperature)
                          }
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="sticky top-0 z-20 bg-neutral-100 text-neutral-500 dark:bg-[#444654] dark:text-neutral-200">
                    <div className="flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                      {selectedConversation?.name}
                      <button
                        className="ml-2 cursor-pointer hover:opacity-50"
                        onClick={handleSettings}
                      >
                        <IconSettings size={18} />
                      </button>
                      <button
                        className="ml-2 cursor-pointer hover:opacity-50"
                        onClick={onClearAll}
                      >
                        <IconClearAll size={18} />
                      </button>
                    </div>
                    {showSettings && (
                      <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                        <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                          <ModelSelect />
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedConversation?.messages.map((message, index) => (
                    <MemoizedChatMessage
                      key={index}
                      message={message}
                      messageIndex={index}
                    />
                  ))}

                  {loading && <ChatLoader />}

                  <div
                    className="h-[210px] bg-white dark:bg-[#343541]"
                    ref={messagesEndRef}
                  />
                </>
              )}
            </div>

            <ChatInput
              textareaRef={textareaRef}
              onSend={(message, chatMode, plugins) => {
                setCurrentMessage(message);
                handleSend(message, 0, chatMode, plugins);
              }}
              onRegenerate={(chatMode, plugins) => {
                if (currentMessage) {
                  handleSend(currentMessage, 2, chatMode, plugins);
                }
              }}
            />
          </>
        )}
        {showScrollDownButton && (
          <div className="absolute bottom-0 right-0 mb-4 mr-4 pb-20">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
              onClick={handleScrollDown}
            >
              <IconArrowDown size={18} />
            </button>
          </div>
        )}
      </div>
    </ChatContext.Provider>
  );
});
Chat.displayName = 'Chat';
