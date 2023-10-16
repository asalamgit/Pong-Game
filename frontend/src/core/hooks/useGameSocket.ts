import { useContext } from 'react';
import { gameSocketContext } from '../context/gameSocketContext';

export function useGameSocket() {
  const value = useContext(gameSocketContext);
  if (!value) {
    throw new Error(
      'useGameSocket can only be used in children of GameSocketProvider'
    );
  }
  return value;
}
