import { User } from '@/core/types/User';
import styles from './Players.module.scss';
type Props = {
  player1Profile: User;
  player2Profile: User;
  playersImages: (string | undefined)[];
  score: number[];
};

const Players = ({
  player1Profile,
  player2Profile,
  playersImages,
  score,
}: Props) => {
  return (
    <>
      {playersImages && (
        <div className={styles.players}>
          <div className={styles.player}>
            <img src={playersImages[0]} className={styles.profileImg} />
            <div className={styles.userNameElo}>
              <p className={styles.username}>{player1Profile.username}</p>
              <span className={styles.elo}>
                ({player1Profile.profile?.points})
              </span>
            </div>
            <p className={styles.point}>{score[0]}</p>
          </div>
          <h2>VS</h2>
          <div className={styles.player}>
            <img src={playersImages[1]} className={styles.profileImg} />
            <div className={styles.userNameElo}>
              <p className={styles.username}>{player2Profile.username}</p>
              <span className={styles.elo}>
                ({player2Profile.profile?.points})
              </span>
            </div>
            <p className={styles.point}>{score[1]}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Players;
