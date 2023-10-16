import { useFile } from '@/core/hooks/useFile';
import { MessageType } from '@/pages/Chat/types/Chat';

import styles from './Message.module.scss';
import { useState } from 'react';
import clsx from 'clsx';

type Props = {
  message: MessageType;
};

export const Message = ({ message }: Props) => {
  const { imageUrl } = useFile(message.userId);
  const today = new Date();
  const date = new Date(message.createdAt);
  const [showMessage, setShowMessage] = useState(false);

  const formatedTime =
    ' at ' +
    date.getHours() +
    'h' +
    (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());

  return (
    <section className={styles.message}>
      <img src={imageUrl} />
      <div className={styles.container}>
        <div className={styles.userInfo}>
          <p className={styles.name}>{message.username}</p>
          <p className={styles.date}>
            {today.toLocaleDateString() === date.toLocaleDateString()
              ? 'Today '
              : date.toLocaleDateString()}
            {formatedTime}
          </p>
        </div>
        {message.isBlocked ? (
          <div>
            <div className={styles.showMessage}>
              <p className={styles.content}>blocked message </p>
              {showMessage ? (
                <p
                  className={styles.content}
                  style={{ color: 'var(--color-blue)' }}
                  onClick={() => setShowMessage(false)}
                >
                  click here to hide
                </p>
              ) : (
                <p
                  className={styles.content}
                  style={{ color: 'var(--color-blue)' }}
                  onClick={() => setShowMessage(true)}
                >
                  click here to see
                </p>
              )}
            </div>
            {showMessage && (
              <p
                className={clsx(
                  styles.content,
                  message.isInfo && styles.infoMessage
                )}
              >
                {message.content}
              </p>
            )}
          </div>
        ) : (
          <p
            className={clsx(
              styles.content,
              message.isInfo && styles.infoMessage
            )}
          >
            {message.content}
          </p>
        )}
      </div>
    </section>
  );
};
