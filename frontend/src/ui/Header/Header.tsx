import styles from './Header.module.scss';
import { JSX } from 'react';

import { Navigation } from './components/Navigation';
import { UserField } from './components/UserField';
import { Notifications } from '../Notifications/Notifications';

import { Link } from 'react-router-dom';

export function Header(): JSX.Element {
  return (
    <div className={styles.header}>
      <Link to="/" className={styles.title}>
        PongGame
      </Link>
      <nav className={styles.menu}>
        <Navigation path={['/profile', '/settings']}>Profile</Navigation>
        <Navigation path={['/game']}>Game</Navigation>
        <Navigation path={['/chat']}>Chat</Navigation>
      </nav>
      <Notifications />

      <UserField />
    </div>
  );
}
