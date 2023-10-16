import { useRef, useState } from 'react';
import styles from './UserField.module.scss';
import { clsx } from 'clsx';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';
import { ExpandMore, AccountCircleOutlined, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useLogin } from '@/core/hooks/useLogin';
import { useUser } from '@/core/hooks/useUser';
import { useFile } from '@/core/hooks/useFile';

export function UserField() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { logout } = useLogin();
  const dropMenuRef = useRef<HTMLDivElement>(null);
  const { imageUrl } = useFile(user?.id);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
  };
  const handleClickOutside = () => {
    if (open) handleOpen();
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (open && event.key === 'Escape') handleOpen();
  };

  useEventListener('keydown', handleEscape);

  useOnClickOutside(dropMenuRef, handleClickOutside);
  return (
    <div className={styles.flex} ref={dropMenuRef}>
      <div className={styles.profileContainer} onClick={handleOpen}>
        <img src={imageUrl} className={styles.profileImg} />
        <p className={styles.username}>{user?.username}</p>
        <ExpandMore
          className={clsx(open && styles.transformArrow, styles.arrow)}
        />
      </div>
      {open && (
        <div className={styles.menu} onKeyDown={handleOpen}>
          <Link
            className={styles.menuButton}
            to="/profile"
            onClick={handleOpen}
          >
            <AccountCircleOutlined />
            <p>Profile</p>
          </Link>
          <div className={styles.sep} />
          <button className={styles.menuButton} onClick={handleLogout}>
            <Logout className={styles.logoutLogo} />
            <p className={styles.logoutText}>Logout</p>
          </button>
        </div>
      )}
    </div>
  );
}
