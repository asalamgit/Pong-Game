import { useContext } from 'react';
import { authContext } from '../context/authContext';

export function useAuth() {
  const value = useContext(authContext);
  if (!value)
    throw new Error('useAuth can only be used in children of AuthProvider');
  return value;
}
