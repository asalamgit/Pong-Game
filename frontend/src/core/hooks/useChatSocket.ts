import { useContext } from 'react';
import { chatSocketContext } from '../context/chatSocketContext';

export function useChatSocket() {
  const value = useContext(chatSocketContext);
  if (!value) {
    throw new Error(
      'useChatSocket can only be used in children of ChatSocketProvider'
    );
  }
  return value;
}
