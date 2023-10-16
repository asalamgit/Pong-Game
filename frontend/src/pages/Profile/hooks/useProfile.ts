import { useApi } from '@/core/hooks/useApi';
import { useEffect, useState } from 'react';
import type { User } from '@/core/types/User';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/core/hooks/useUser';

export function useProfile() {
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user: myUser } = useUser();
  const [user, setUser] = useState<User>();
  const { api } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await api.get<User>(`/api/users/${id ?? myUser?.id}`);

        setUser(response.data);
        setLoading(false);
      } catch {
        navigate('/profile', { replace: true });
      }
    };

    getUser();
  }, [api, id, myUser?.id]);

  return { user, loading };
}
