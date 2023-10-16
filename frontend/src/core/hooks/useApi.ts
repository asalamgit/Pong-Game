import { useEffect } from 'react';
import { api } from '../api';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';
import { useRefeshToken } from './useRefreshToken';

declare module 'axios' {
  export interface AxiosRequestConfig {
    sent?: boolean;
  }
}

export function useApi() {
  const { auth, setAuth } = useAuth();
  const { refresh } = useRefeshToken();

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers.Authorization && auth?.accessToken) {
          config.headers.Authorization = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => {
        throw error;
      }
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest: InternalAxiosRequestConfig = error?.config;

        if (error?.response?.status === 401 && !prevRequest.sent) {
          prevRequest.sent = true;
          const { accessToken, needTwoFa } = await refresh();
          prevRequest.headers.Authorization = `Bearer ${accessToken}`;
          setAuth({ accessToken, needTwoFa });
          return api(prevRequest);
        }

        throw error;
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh, setAuth]);

  return { api };
}
