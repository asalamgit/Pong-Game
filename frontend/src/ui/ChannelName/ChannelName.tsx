import { Channel } from '@/pages/Chat/types/Chat';
import styles from './ChannelName.module.scss';

type Props = {
  channel: Channel;
  onClick?: () => void;
};

export function ChannelName({ channel, onClick }: Props) {
  const letter = channel.name.toUpperCase()[0];

  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.letter}>{letter}</div>
      <p className={styles.name}>{channel.name}</p>
    </div>
  );
}
