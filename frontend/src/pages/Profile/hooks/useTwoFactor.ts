import { useApi } from '@/core/hooks/useApi';
import { useAuth } from '@/core/hooks/useAuth';
import { useUser } from '@/core/hooks/useUser';
import { useState } from 'react';

type ApiResponse = {
  secret: string;
  url: string;
};

export function useTwoFactor() {
  const { api } = useApi();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState<string>();
  const [secret, setSecret] = useState<string>();
  const { setAuth } = useAuth();
  const { user, setUser } = useUser();
  const isTwoFaEnable = user ? user.isTwoFa : false;
  const [error, setError] = useState(false);

  const handleOpen = async () => {
    try {
      if (!isTwoFaEnable) {
        const response = await api.get<ApiResponse>('/api/auth/2fa/generate');

        setQrCode(response.data.url);
        setSecret(response.data.secret);
      }
      setOpen(true);
    } catch {
      // do nothing
    }
  };

  const handleClose = () => setOpen(false);

  const onTwoFactorInputChange = (newCode: string) => setCode(newCode);

  const onEnableTwoFactor = async () => {
    try {
      const response = await api.post('/api/auth/2fa/authenticate', { code });

      setAuth((prev) => ({
        ...prev,
        accessToken: response.data.accessToken,
        needTwoFa: false,
      }));
      handleClose();
      user && setUser({ ...user, isTwoFa: true });
    } catch {
      setError(true);
    }
  };

  const onDisableTwoFactor = async () => {
    try {
      await api.post('/api/auth/2fa/disable', { code });
      handleClose();
      user && setUser({ ...user, isTwoFa: false });
    } catch {
      setError(true);
    }
  };

  return {
    open,
    qrCode,
    secret,
    handleClose,
    handleOpen,
    onEnableTwoFactor,
    onDisableTwoFactor,
    onTwoFactorInputChange,
    error,
    isTwoFaEnable,
  };
}
