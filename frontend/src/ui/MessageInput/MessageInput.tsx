import { useState } from 'react';
import styles from './MessageInput.module.scss';
import { Send } from '@mui/icons-material';
import { Channel, ChannelUser, Type } from '@/pages/Chat/types/Chat';

type Props = {
  usersList: ChannelUser[];
  selectedChannel: Channel;
  unblock: any;
  sendMessage: (content: string, channel: Channel) => void;
};

export const MessageInput = ({
  usersList,
  selectedChannel,
  sendMessage,
  unblock,
}: Props) => {
  const [messageText, setMessageText] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedChannel) sendMessage(messageText, selectedChannel);
    setMessageText('');
  };

  if (
    selectedChannel.type === Type.DIRECT_MESSAGE &&
    usersList[0] &&
    usersList[0].isBlocked
  )
    return (
      <div className={styles.blockStatement}>
        <p className={styles.instruction}>
          you can't send a message to someone you've blocked
        </p>
        <button
          className={styles.unblockButton}
          onClick={() => {
            if (usersList[0]) unblock(usersList[0].id, true);
          }}
        >
          Unblock
        </button>
      </div>
    );

  return (
    <div className={styles.messageInputContainer}>
      <form onSubmit={handleSubmit}>
        <input
          className={styles.messageInput}
          placeholder="Type a message here"
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
        />
        <button type="submit" className={styles.messageSendbutton}>
          <Send sx={{ color: 'white' }} />
        </button>
      </form>
    </div>
  );
};
