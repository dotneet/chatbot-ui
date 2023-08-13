import { IconCircleX } from '@tabler/icons-react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  error: Error;
}

export const ErrorMessageDiv: FC<Props> = ({ error }) => {
  const { t } = useTranslation('chat');
  const title = t('Error fetching models.');
  return (
    <div className="mx-6 flex h-full flex-col items-center justify-center text-red-500">
      <div className="mb-5">
        <IconCircleX size={36} />
      </div>
      <div className="mb-3 text-2xl font-medium">{title}</div>
      <div className="text-center">{error.message}</div>
    </div>
  );
};
