import { JSX, ReactNode, useEffect, useState } from 'react';
import { authContext } from '../context/authContext';
import type { Auth } from '../types/Auth';
import { useRefeshToken } from '../hooks/useRefreshToken';
import { PageLoading } from '@/ui';

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props): JSX.Element {
  const [auth, setAuth] = useState<Auth>({});
  const { refresh } = useRefeshToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshTokens = async () => {
      try {
        const { accessToken, needTwoFa } = await refresh();
        setAuth({ accessToken, needTwoFa });
      } catch {
        // do nothing
      } finally {
        setLoading(false);
      }
    };

    auth?.accessToken ? setLoading(false) : refreshTokens();
  }, [auth?.accessToken, refresh]);

  if (loading) return <PageLoading />;

  return (
    <authContext.Provider value={{ auth, setAuth }}>
      {children}
    </authContext.Provider>
  );
}
