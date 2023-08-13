import { useCallback, useState } from 'react';

interface Props {
  inputRef?: React.RefObject<HTMLInputElement>;
}
export const InputText = ({
  inputRef,
  onChange,
  onKeyDown,
  ...restProps
}: Props & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [lastDownKey, setLastDownKey] = useState<string>('');
  const [endComposing, setEndComposing] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.call(e, e);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // safari support
      const composing = endComposing;
      setLastDownKey(e.key);
      setEndComposing(false);
      if (e.key === 'Enter' && composing) {
        return;
      }
      if (isTyping || e.key !== 'Enter') {
        return;
      }
      onKeyDown?.call(e, e);
    },
    [endComposing, isTyping, onKeyDown],
  );

  return (
    <input
      ref={inputRef}
      type="text"
      onCompositionStart={() => {
        setIsTyping(true);
        setEndComposing(true);
      }}
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
