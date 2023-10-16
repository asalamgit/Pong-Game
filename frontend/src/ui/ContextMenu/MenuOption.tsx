import styles from './MenuOption.module.scss';
import { ReactNode, JSX } from 'react';

type Props = {
  children: ReactNode;
  onClick?: () => void;
};

export function MenuOption({ children, onClick }: Props): JSX.Element {
  return (
    <div onClick={onClick}>
      <p className={styles.option}>{children}</p>
    </div>
  );
}
