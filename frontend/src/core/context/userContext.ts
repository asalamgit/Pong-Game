import { Dispatch, SetStateAction, createContext } from 'react';
import { User } from '../types/User';

type UserContext = {
  user: User | undefined;
  refetchUser(token?: string): Promise<void>;
  setUser: Dispatch<SetStateAction<User | undefined>>;
};

export const userContext = createContext<UserContext | undefined>(undefined);
