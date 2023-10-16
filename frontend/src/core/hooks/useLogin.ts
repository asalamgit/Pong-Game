import axios from 'axios';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from './useApi';

type ApiResponse = {
  accessToken: string;
  needTwoFa: boolean;
};

type Provider =
  | {
      type: 'signin' | 'signup';
      data: { username: string; password: string };
    }
  | {
      type: '42' | 'google' | 'facebook';
    };

export function useLogin() {
  const { setAuth } = useAuth();
  const { api } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('code');
    const needTwoFa = searchParams.get('twoFa');
    if (accessToken) {
      setAuth((prev) => ({
        ...prev,
        accessToken,
        needTwoFa: needTwoFa === 'true' ? true : false,
      }));
      searchParams.delete('code');
      searchParams.delete('twoFa');
      setSearchParams(searchParams);
    }
  }, [searchParams, setAuth, setSearchParams]);

  const login = async (provider: Provider) => {
    switch (provider.type) {
      case '42':
        window.location.href = `http://${window.location.hostname}:3000/api/auth/42`;
        break;
      case 'google':
        window.location.href = `http://${window.location.hostname}:3000/api/auth/google`;
        break;
      case 'facebook':
        window.location.href = `http://${window.location.hostname}:3000/api/auth/facebook`;
        break;
      case 'signin': {
        const response = await axios.post<ApiResponse>(
          '/api/auth/signin',
          provider.data
        );
        setAuth((prev) => ({
          ...prev,
          accessToken: response.data.accessToken,
          needTwoFa: response.data.needTwoFa,
        }));
        break;
      }
      case 'signup': {
        const response = await axios.post<ApiResponse>(
          '/api/auth/signup',
          provider.data
        );
        setAuth((prev) => ({
          ...prev,
          accessToken: response.data.accessToken,
          needTwoFa: response.data.needTwoFa,
        }));
        break;
      }
      default:
        throw new Error('Unknown provider type');
    }
  };

  const logout = async () => {
    try {
      await api.get('/api/auth/logout');
      setAuth((prev) => {
        delete prev.accessToken;
        delete prev.needTwoFa;
        return { ...prev };
      });
    } catch {
      // do nothing
    }
  };

  return { login, logout };
}
