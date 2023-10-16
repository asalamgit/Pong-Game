import { useContext } from 'react';
import { userContext } from '../context/userContext';

export function useUser() {
  const value = useContext(userContext);
  if (!value) {
    throw new Error('useUser can only be used in children of UserProvider');
  }
  return value;
}
