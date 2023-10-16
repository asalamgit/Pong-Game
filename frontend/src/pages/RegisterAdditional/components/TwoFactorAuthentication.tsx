import { useApi } from '@/core/hooks/useApi';
import { useAuth } from '@/core/hooks/useAuth';
import { useLogin } from '@/core/hooks/useLogin';
import { Button, Alert } from '@mui/material';

import styles from './TwoFactorAuthentication.module.scss';
import { TwoFactorInput } from '@/ui/TwoFactorInput/TwoFactorInput';
import { useState } from 'react';
import { useUser } from '@/core/hooks/useUser';

export function TwoFactorAuthentication() {
  const { api } = useApi();
  const { setAuth } = useAuth();
  const { logout } = useLogin();
  const [error, setError] = useState(false);
  const { refetchUser } = useUser();

  const onChange = async (code: string) => {
    try {
      const response = await api.post('/api/auth/2fa/authenticate', {
        code,
      });
      await refetchUser(response.data.accessToken);
      setAuth((prev) => ({
        ...prev,
        accessToken: response.data.accessToken,
        needTwoFa: false,
      }));
    } catch {
      setError(true);
    }
  };

  return (
    <div className={styles.card}>
      <p className={styles.twoFaTitle}>
        Two-Factor <br />
        Authentication
      </p>
      <TwoFactorInput onChange={onChange} onSubmit={onChange} />
      {error && <Alert severity="error">Wrong code</Alert>}
      <Button onClick={logout} variant="outlined">
        Logout
      </Button>
    </div>
  );
}
