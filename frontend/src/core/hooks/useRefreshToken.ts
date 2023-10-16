import axios from 'axios';
import { useCallback } from 'react';

type ApiResponse = {
  accessToken: string;
  needTwoFa: boolean;
};

export function useRefeshToken() {
  const refresh = useCallback(async () => {
    const response = await axios.get<ApiResponse>('/api/auth/token', {
      withCredentials: true,
    });

    return response.data;
  }, []);

  return { refresh };
}
