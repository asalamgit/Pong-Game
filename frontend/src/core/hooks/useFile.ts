import axios from 'axios';
import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { User } from '../types/User';

type ApiResponse = {
  url: string;
  fields: {
    'Content-Type': string;
    Policy: string;
    'X-Amz-Algorithm': string;
    'X-Amz-Credentials': string;
    'X-Amz-Date': string;
    'X-Amz-Signature': string;
    bucket: string;
    key: string;
  };
};

export function useFile(userId?: number) {
  const { api } = useApi();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const getFile = async () => {
    try {
      if (!userId) throw new Error('No user id');
      const response = await api.get<User>(`/api/users/${userId}`);

      setImageUrl(response.data.image ?? `http://${window.location.hostname}:8080/default.jpg`);
    } catch {
      setImageUrl(`http://${window.location.hostname}:8080/default.jpg`);
    }
  };

  const sendFile = async (file: File) => {
    if (!userId) return;

    try {
      const response = await api.post<ApiResponse>('/api/file/upload', {
        name: file.name,
        type: file.type,
      });

      const form = new FormData();
      Object.entries(response.data.fields).forEach((field) => {
        form.append(field[0], field[1]);
      });
      form.append('file', file);
      await axios.post(response.data.url, form);

      await api.put('/api/file/confirm', { name: file.name });

      await getFile();
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    getFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { sendFile, imageUrl, getFile };
}
