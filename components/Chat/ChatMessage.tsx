import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconRobot,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { FC, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import useConversations from '@/hooks/useConversations';
import useMesseageSender from '@/hooks/useMessageSender';

import { Message } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import ChatContext from './Chat.context';

import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export interface Props {
  message: Message;
  messageIndex: number;
}

export const useTokenAdder = (slowMode: boolean, setText: (reply: string) => void) => {
  const r = useRef("")
  const rr = useRef("")
  const pendingTokens = useRef<string[]>([]);
  const adding = useRef(false);
  const addTokens = useCallback((newTokens: string) => {
    pendingTokens.current.push(...Array.from(newTokens));
    rr.current += newTokens;
    if (!adding.current) {
      adding.current = true;
      setTimeout(async () => {
        while (pendingTokens.current.length) {
          r.current += pendingTokens.current.shift();
          setText(r.current);
          if (slowMode) await new Promise(r => setTimeout(r, 30));
          await new Promise(r => requestAnimationFrame(r));
        }
        adding.current = false;
      }, 0);
    }
  }, [setText, slowMode]);
  return [addTokens, r, rr] as const;
};

export const ChatMessage: FC<Props> = memo(({ message, messageIndex }) => {
  const { t } = useTranslation('chat');
  const [_, conversationsAction] = useConversations();
  const sendMessage = useMesseageSender();

  const {
    state: { selectedConversation, conversations },
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const {
    state: { selectedPlugins, chatMode },
  } = useContext(ChatContext);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState(message.content);
  const [messagedCopied, setMessageCopied] = useState(false);

  const [addTokens, r, rr] = useTokenAdder(false, setMessageContent)

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEditMessage = async () => {
    if (message.content != messageContent) {
      if (selectedConversation) {
        const updatedMessages = selectedConversation.messages
          .map((m, i) => {
            if (i < messageIndex) {
              return m;
            }
          })
          .filter((m) => m) as Message[];
        const deleteCount =
          selectedConversation.messages.length - updatedMessages.length;
        const updatedConversation = {
          ...selectedConversation,
          messages: updatedMessages,
        };
        homeDispatch({
          field: 'selectedConversation',
          value: selectedConversation,
        });
        homeDispatch({
          field: 'currentMessage',
          value: { ...message, content: messageContent },
        });
        await conversationsAction.update(updatedConversation);

        const newMessage = { ...message, content: messageContent };
        sendMessage(newMessage, deleteCount, chatMode, selectedPlugins);
      }
    }
    setIsEditing(false);
  };

  const handleDeleteMessage = async () => {
    if (!selectedConversation) return;

    const { messages } = selectedConversation;
    const targetMessage = messages[messageIndex];
    const nextMessage = messages[messageIndex + 1];
    const valid =
      targetMessage &&
      message.content == targetMessage.content &&
      targetMessage.role == message.role;
    if (!valid) {
      return;
    }
    if (nextMessage && nextMessage.role === 'assistant') {
      messages.splice(messageIndex, 2);
    } else {
      messages.splice(messageIndex, 1);
    }
    const updatedConversation = {
      ...selectedConversation,
      messages,
    };

    await conversationsAction.update(updatedConversation);
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault();
      handleEditMessage();
    }
  };

  const copyOnClick = () => {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(message.content).then(() => {
      setMessageCopied(true);
      setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
    });
  };

  useEffect(() => {
    if (message.role === 'user') return setMessageContent(message.content)
    if (message.content === messageContent || message.content.length <= rr.current.length)
      r.current = rr.current = message.content;
    else
      addTokens(message.content.slice(rr.current.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content, addTokens]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  return (
    <div
      className={`group md:px-4 ${message.role === 'assistant'
        ? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100'
        : 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'
        }`}
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] text-right font-bold">
          {message.role === 'assistant' ? (
            <IconRobot size={30} />
          ) : (
            <IconUser size={30} />
          )}
        </div>

        <div className="prose mt-[-2px] w-full dark:prose-invert">
          {message.role === 'user' ? (
            <div className="flex w-full">
              {isEditing ? (
                <div className="flex w-full flex-col">
                  <textarea
                    ref={textareaRef}
                    className="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]"
                    value={messageContent}
                    onChange={handleInputChange}
                    onKeyDown={handlePressEnter}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: 'inherit',
                      padding: '0',
                      margin: '0',
                      overflow: 'hidden',
                    }}
                  />

                  <div className="mt-10 flex justify-center space-x-4">
                    <button
                      className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                      onClick={handleEditMessage}
                      disabled={messageContent.trim().length <= 0}
                    >
                      {t('Save & Submit')}
                    </button>
                    <button
                      className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMessageContent(message.content);
                        setIsEditing(false);
                      }}
                    >
                      {t('Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose whitespace-pre-wrap dark:prose-invert flex-1">
                  {message.content}
                </div>
              )}

              {!isEditing && (
                <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={toggleEditing}
                  >
                    <IconEdit size={20} />
                  </button>
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={handleDeleteMessage}
                  >
                    <IconTrash size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-row">
              <MemoizedReactMarkdown
                className="prose dark:prose-invert flex-1"
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeMathjax]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');

                    return !inline ? (
                      <CodeBlock
                        key={Math.random()}
                        language={(match && match[1]) || ''}
                        value={String(children).replace(/\n$/, '')}
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                        {children}
                      </table>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="break-words border border-black px-3 py-1 dark:border-white">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {messageContent}
              </MemoizedReactMarkdown>

              <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
                {messagedCopied ? (
                  <IconCheck
                    size={20}
                    className="text-green-500 dark:text-green-400"
                  />
                ) : (
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={copyOnClick}
                  >
                    <IconCopy size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';
