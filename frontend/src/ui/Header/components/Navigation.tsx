import { ReactNode } from 'react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

import styles from './Navigation.module.scss';

type Props = {
  path: string[];
  children: ReactNode;
};

export function Navigation({ path, children }: Props): JSX.Element {
  const location = useLocation();
  const isSelected = path.some((pathname) =>
    location.pathname.includes(pathname)
  );

  return (
    <div className={styles.navigation}>
      <Link
        to={path[0]}
        className={clsx(styles.link, isSelected && styles.link__selected)}
      >
        {children}
      </Link>
      {isSelected && <div className={styles.bar} />}
    </div>
  );
}
