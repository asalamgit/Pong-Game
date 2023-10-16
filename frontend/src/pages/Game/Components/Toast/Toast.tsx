import { Close, Check } from '@mui/icons-material';

import styles from './Toast.module.scss';
interface ToastProps {
  message: string;
  onAccept: () => void;
  onDecline: () => void;
  isToastVisible: boolean;
  closeToast: () => void;
  index: number;
}

const Toast = (props: ToastProps) => {
  const thisIsVisible = props.isToastVisible;

  return (
    <>
      {thisIsVisible && (
        <div
          className={styles.toast}
          style={{ top: `${80 * props.index + 20}px` }}
        >
          <p>{props.message}</p>
          <button
            className={styles.acceptButton}
            onClick={() => {
              props.onAccept();
              props.closeToast();
            }}
          >
            <Check />
          </button>
          <button
            className={styles.declineButton}
            onClick={() => {
              props.onDecline();
              props.closeToast();
            }}
          >
            <Close />
          </button>
        </div>
      )}
    </>
  );
};

export default Toast;
