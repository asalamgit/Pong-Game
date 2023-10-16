import { useRef, useState } from 'react';
import styles from './JoinProtected.module.scss';
import { Channel } from '@/pages/Chat/types/Chat';
import { useOnClickOutside } from 'usehooks-ts';

type Props = {
  joinChannel: (channelId: string, password?: string | undefined) => void;
  protectedChannelClicked: Channel | undefined;
  setProtectedChannelClicked: React.Dispatch<
    React.SetStateAction<Channel | undefined>
  >;
};

export function JoinProtected({
  protectedChannelClicked,
  setProtectedChannelClicked,
  joinChannel,
}: Props) {
  const [passwordText, setPasswordText] = useState('');
  const boxRef = useRef(null);
  const handleJoinProtectedChannel = (e: any) => {
    e.preventDefault();
    if (protectedChannelClicked)
      joinChannel(protectedChannelClicked.id, passwordText);
    setProtectedChannelClicked(undefined);
    setPasswordText('');
  };

  const handleClickOutside = () => {
    setProtectedChannelClicked(undefined);
  };

  useOnClickOutside(boxRef, handleClickOutside);

  return (
    <div className={styles.container}>
      <div className={styles.box} ref={boxRef}>
        <p>This channel is protected</p>
        <form className={styles.field}onSubmit={(e) => handleJoinProtectedChannel(e)}>
          <input
            className={styles.password}
            type="text"
            autoFocus={true}
            placeholder="password"
            value={passwordText}
            onChange={(e) => setPasswordText(e.target.value)}
          />
          <button className={styles.enter}type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
}
