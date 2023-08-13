import React, { DetailedHTMLProps, useCallback, useState } from 'react';

interface Props {
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  rows?: number;
}

export const Textarea = ({
  textareaRef,
  rows,
  onChange,
  onKeyDown,
  ...restProps
}: Props &
  DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [lastDownKey, setLastDownKey] = useState<string>('');
  const [endComposing, setEndComposing] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.call(e, e);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // safari support
      const composing = endComposing;
      setLastDownKey(e.key);
      setEndComposing(false);
      if (e.key === 'Enter' && composing) {
        return;
      }
      if (isTyping) {
        return;
      }
      onKeyDown?.call(e, e);
    },
    [endComposing, isTyping, onKeyDown],
  );

  return (
    <textarea
      ref={textareaRef}
      rows={rows}
      onCompositionStart={() => setIsTyping(true)}
      onCompositionEnd={() => {
        setIsTyping(false);
        if (lastDownKey !== 'Enter') {
          setEndComposing(true);
        }
      }}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...restProps}
    />
  );
};
