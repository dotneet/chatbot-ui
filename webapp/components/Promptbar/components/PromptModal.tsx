import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Prompt } from '@/types/prompt';

import { Dialog } from '@/components/Dialog/Dialog';
import { InputText } from '@/components/Input/InputText';
import { Textarea } from '@/components/Input/Textarea';

interface Props {
  open: boolean;
  prompt: Prompt;
  onClose: () => void;
  onUpdatePrompt: (prompt: Prompt) => void;
}

export const PromptModal: FC<Props> = ({
  open,
  prompt,
  onClose,
  onUpdatePrompt,
}) => {
  const { t } = useTranslation('promptbar');
  const [name, setName] = useState(prompt.name);
  const [description, setDescription] = useState(prompt.description);
  const [content, setContent] = useState(prompt.content);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      onUpdatePrompt({ ...prompt, name, description, content: content.trim() });
      onClose();
    }
  };

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onCompositionStart={() => setIsTyping(true)}
      onCompositionEnd={() => setIsTyping(false)}
      onKeyDown={handleEnter}
    >
      <div className="text-sm font-bold text-black dark:text-neutral-200">
        {t('Name')}
      </div>
      <InputText
        inputRef={nameInputRef}
        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
        placeholder={t('A name for your prompt.') || ''}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
        {t('Description')}
      </div>
      <Textarea
        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
        style={{ resize: 'none' }}
        placeholder={t('A description for your prompt.') || ''}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
        {t('Prompt')}
      </div>
      <Textarea
        className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
        style={{ resize: 'none' }}
        placeholder={
          t(
            'Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}',
          ) || ''
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
      />
      <button
        type="button"
        className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
        onClick={() => {
          const updatedPrompt = {
            ...prompt,
            name,
            description,
            content: content.trim(),
          };

          onUpdatePrompt(updatedPrompt);
          onClose();
        }}
      >
        {t('Save')}
      </button>
    </Dialog>
  );
};
