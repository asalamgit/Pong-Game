import { Dispatch, SetStateAction, createContext } from 'react';
import type { Auth } from '../types/Auth';

type AuthContext = {
  auth: Auth;
  setAuth: Dispatch<SetStateAction<Auth>>;
};

export const authContext = createContext<AuthContext | undefined>(undefined);
