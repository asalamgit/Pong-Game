import { usePong } from './hooks/usePong';
import styles from './Game.module.scss';
import CircularProgress from '@mui/material/CircularProgress';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Players from './Components/Score/Players';
import Dropdown from './Components/Dropdown/Dropdown';
import { useLocation } from 'react-router-dom';

export const Game: React.FC = () => {
  const {
    room,
    score,
    canvasRef,
    giveUp,
    player1Profile,
    player2Profile,
    selectedMode,
    handleModeChange,
    selectedOpponent,
    handleOpponentChange,
    joinQueue,
    loading,
    quitQueue,
    playersImages,
    setSelectedOpponent,
    usersList,
  } = usePong();

  useEffect(() => {
    return () => {
      if (loading === true) {
        quitQueue();
      }
    };
  }, [loading]);

  const location = useLocation();

  useEffect(() => {
    if (location && location.state)
      setSelectedOpponent(location.state.opponent.toString());
  }, []);

  return (
    <div
      className={styles.game}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!loading && !room && (
        <>
          <Dropdown
            title="Game Mode"
            value={selectedMode}
            handleChange={handleModeChange}
            options={[
              { value: 'normal', name: 'Normal' },
              { value: 'speedBall', name: 'Speed Ball' },
              { value: 'paddleReduce', name: 'Paddle Reduce' },
            ]}
          />
          <Dropdown
            title="Opponent"
            value={selectedOpponent}
            handleChange={handleOpponentChange}
            options={[
              { value: 'random', name: 'Random' },
              ...usersList.map((user: any) => ({
                value: user.id,
                name: user.username,
              })),
            ]}
          />
        </>
      )}
      {!loading && !room ? (
        <button
          className={clsx(styles.startGame, styles.greenButton)}
          onClick={() => joinQueue()}
        >
          Start game
        </button>
      ) : loading && !room ? (
        <button
          className={clsx(styles.startGame, styles.redButton)}
          onClick={() => quitQueue()}
        >
          Quit
        </button>
      ) : null}
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
        {loading && (
          <CircularProgress
            className={styles.spinner}
            style={{
              width: '5%',
              height: '5%',
            }}
          />
        )}
      </div>
      {player1Profile && player2Profile && !loading && (
        <Players
          player1Profile={player1Profile}
          player2Profile={player2Profile}
          playersImages={playersImages}
          score={score}
        />
      )}
      {room != null && (
        <button className={styles.giveUp} onClick={giveUp}>
          Give up
        </button>
      )}
    </div>
  );
};
