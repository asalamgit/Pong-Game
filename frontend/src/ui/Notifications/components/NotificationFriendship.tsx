import styles from './NotificationFriendship.module.scss';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { useFriends } from '@/core/hooks/useFriends';
import { Notification } from '../types/Notification';
import { JSX } from 'react';
import clsx from 'clsx';
type Props = {
  notification: Notification;
};

export function NotificationFriendship({ notification }: Props): JSX.Element {
  const { addFriend, declineInvite } = useFriends();

  return (
    <div className={styles.container}>
      <p>Friend request from <b>{notification.owner.username}</b></p>
      <div className={styles.buttons}>
        <button
          className={clsx(styles.button, styles.acceptButton)}
          onClick={() => {
            addFriend(notification.owner.id);
          }}
        >
          <CheckIcon className={styles.icon}/>
        </button>
        <button
          className={clsx(styles.button, styles.denyButton)}
          onClick={() => {
            declineInvite(notification);
          }}
        >
          <CloseIcon className={styles.icon}/>
        </button>
      </div>
    </div>
  );
}
