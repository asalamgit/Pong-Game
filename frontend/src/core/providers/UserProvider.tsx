import { userContext } from '../context/userContext';
import { useState, useEffect, ReactNode, JSX } from 'react';
import { useApi } from '../hooks/useApi';
import { User } from '../types/User';
import { PageLoading } from '@/ui';
import { AxiosRequestConfig } from 'axios';

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props): JSX.Element {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const { api } = useApi();

  const refetchUser = async (token?: string) => {
    try {
      const options: AxiosRequestConfig | undefined = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;
      const response = await api.get('/api/users/me', options);
      setUser(response.data);
    } catch {
      // do nothing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <PageLoading />;

  return (
    <userContext.Provider value={{ user, refetchUser, setUser }}>
      {children}
    </userContext.Provider>
  );
}
