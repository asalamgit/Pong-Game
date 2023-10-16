import { useGameSocket } from '@/core/hooks/useGameSocket';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { BallInfo, StartGameInfo } from '../types/Game';
import { useUser } from '../../../core/hooks/useUser';
import { User } from '@/core/types/User';
import { toast } from 'react-toastify';
import { AcceptInvitation } from '@/core/types/Invitation';
import { usePlayersImage } from './usePlayersImage';
import { useCanvas } from './useCanvas';

export function usePong() {
  const { socket } = useGameSocket();
  const { user } = useUser();
  const {
    canvasRef,
    contextRef,
    canvasSettings,
    clearCanvas,
    drawElements,
    ball,
    paddle1,
    paddle2,
    paddle,
  } = useCanvas();

  const [score, setScore] = useState([0, 0]);
  const [isPlayerLeft, setIsPlayerLeft] = useState(false);
  const [room, setRoom] = useState<string | null>(null);
  const [player1Profile, setplayer1Profile] = useState<User | null>(null);
  const [player2Profile, setplayer2Profile] = useState<User | null>(null);
  const [selectedMode, setSelectedMode] = useState('normal');
  const { playersImages } = usePlayersImage(player1Profile, player2Profile);
  const [selectedOpponent, setSelectedOpponent] = useState('random');
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const activeGame = useRef(false);

  useEffect(() => {
    if (!socket || !user) return;

    socket.on('startGame', startGameListener);

    socket.on('score', scoreListener);

    socket.on('endGame', endGameListener);

    socket.on('acceptInvitation', acceptInvitationListener);

    socket.on('declineInvitation', declineInvitationListener);

    socket.on('cannotJoinQueue', cannotJoinQueueListener);

    return () => {
      if (room && activeGame.current === true) {
        socket.emit('quit', { room: room, userId: user.id });
        socket.emit('leaveRoom', room);
      }
      socket.off('startGame', startGameListener);
      socket.off('score', scoreListener);
      socket.off('endGame', endGameListener);
      socket.off('acceptInvitation', acceptInvitationListener);
      socket.off('declineInvitation', declineInvitationListener);
      socket.off('cannotJoinQueue', cannotJoinQueueListener);
    };
  }, [socket, room]);

  useEffect(() => {
    socket &&
      user &&
      socket.emit('getAllUsers', (response: any) => {
        const deleteUser = response.filter(
          (element: any) => element.id !== user.id
        );
        setUsersList(deleteUser);
      });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('paddleLeftMove', paddleLeftMoveListener);
    socket.on('paddleRightMove', paddleRightMoveListener);
    socket.on('ballMove', ballMoveListener);
    return () => {
      if (!socket || !user) return;
      socket.off('ballMove', ballMoveListener);
      socket.off('paddleLeftMove', paddleLeftMoveListener);
      socket.off('paddleRightMove', paddleRightMoveListener);
    };
  }, [socket, room, canvasSettings, loading]);

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === 'a') {
        paddle.current.speed = -5;
      }
      if (event.key === 'q') {
        paddle.current.speed = 5;
      }
    };

    const handleKeyUp = (event: { key: string }) => {
      if (event.key === 'a' || event.key === 'q') {
        paddle.current.speed = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlayerLeft, socket, room]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      loading && socket && user && quitQueue();
      room != null && giveUp();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, room, user, loading]);

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMode(event.target.value);
  };

  const handleOpponentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOpponent(event.target.value);
  };

  const joinQueue = (argMode?: string, argOpponent?: string) => {
    if (player1Profile && player2Profile) {
      setplayer1Profile(null);
      setplayer2Profile(null);
    }
    clearCanvas();
    if (socket && user) {
      socket.emit('ready', {
        userId: user.id,
        username: user.username,
        mode: argMode ? argMode : selectedMode,
        opponent: argOpponent ? argOpponent : selectedOpponent,
      });
      setLoading(true);
    }
  };

  const quitQueue = () => {
    if (socket && user) {
      socket.emit('quitQueue', {
        userId: user.id,
        mode: selectedMode,
        opponent: selectedOpponent,
      });

      setLoading(false);
    }
  };

  const startGameListener = (startGameInfo: StartGameInfo) => {
    setLoading(false);
    setScore([0, 0]);
    setRoom(startGameInfo.room);
    activeGame.current = true;
    setplayer1Profile(startGameInfo.player1Profile);
    setplayer2Profile(startGameInfo.player2Profile);
    socket && user && setIsPlayerLeft(user.id === startGameInfo.playerLeftId);
  };

  const acceptInvitationListener = (acceptInvitation: AcceptInvitation) => {
    if (
      room &&
      acceptInvitation.mode === selectedMode &&
      acceptInvitation.opponentId.toString() === selectedOpponent
    )
      return;
    setSelectedMode(acceptInvitation.mode);
    setSelectedOpponent(acceptInvitation.opponentId.toString());
    joinQueue(acceptInvitation.mode, acceptInvitation.opponentId.toString());
  };

  const declineInvitationListener = (opponentName: string) => {
    toast.error(`${opponentName} declined your invitation`);
    quitQueue();
  };

  const endGameMessage = (message: string) => {
    const context = contextRef.current;
    if (context) {
      context.font = '48px Arial';
      context.fillStyle = message === 'You win !' ? '#23FD00' : 'red';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        message,
        context.canvas.width / 2,
        context.canvas.height / 2
      );
    }
  };

  const endGameListener = (scoreInfo: number[]) => {
    clearCanvas();
    endGameMessage(
      (scoreInfo[0] === 3 && isPlayerLeft === true) ||
        (scoreInfo[1] === 3 && isPlayerLeft === false)
        ? 'You win !'
        : 'You lose !'
    );
    socket && socket.emit('leaveRoom', room);
    activeGame.current = false;
    paddle1.current.height = 50;
    paddle2.current.height = 50;
    setRoom(null);
  };

  const paddleLeftMoveListener = (paddleYPosition: number) => {
    paddle1.current.y = paddleYPosition;
    drawElements();
  };

  const paddleRightMoveListener = (paddleYPosition: number) => {
    paddle2.current.y = paddleYPosition;
    drawElements();
  };

  const ballMoveListener = (ballInfo: BallInfo) => {
    ball.current.x = ballInfo.x;
    ball.current.y = ballInfo.y;
    if (selectedMode === 'paddleReduce') {
      paddle1.current.y = ballInfo.paddle1Y;
      paddle2.current.y = ballInfo.paddle2Y;
      paddle1.current.height = ballInfo.paddle1Height;
      paddle2.current.height = ballInfo.paddle2Height;
    }
    if (paddle.current.speed !== 0) {
      socket?.emit('paddleMove', {
        room,
        isPlayerLeft,
        paddleSpeed: paddle.current.speed,
      });
    }
    drawElements();
  };

  const cannotJoinQueueListener = () => {
    toast.error('2 different browser try to play in same time');
    quitQueue();
    setLoading(false);
  };

  const scoreListener = (scoreInfo: number[]) => {
    setScore(scoreInfo);
  };

  const giveUp = () => {
    if (socket && room && user) {
      socket.emit('quit', { room: room, userId: user.id });
    }
  };

  return {
    room,
    score,
    canvasRef,
    isPlayerLeft,
    giveUp,
    player1Profile,
    player2Profile,
    selectedMode,
    handleModeChange,
    selectedOpponent,
    handleOpponentChange,
    setSelectedOpponent,
    joinQueue,
    loading,
    quitQueue,
    playersImages,
    usersList,
  };
}
