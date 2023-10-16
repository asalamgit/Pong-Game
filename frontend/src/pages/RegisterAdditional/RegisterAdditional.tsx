import { FormEvent, useState } from 'react';
import styles from './RegisterAdditional.module.scss';
import { useApi } from '@/core/hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/core/hooks/useUser';
import { TextField } from '@mui/material';
import { useAuth } from '@/core/hooks/useAuth';
import { TwoFactorAuthentication } from './components/TwoFactorAuthentication';

export function RegisterAdditional() {
  const { setUser } = useUser();
  const { api } = useApi();
  const {
    auth: { needTwoFa },
  } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = { username };
    try {
      const response = await api.post('/api/users/update_username', data, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.status === 201) {
        setUser(
          (prev) => prev && { ...prev, username: response.data.username }
        );
        return navigate('/');
      }
    } catch {
      setError(true);
    }
  }

  return (
    <div className={styles.container}>
      {needTwoFa ? (
        <TwoFactorAuthentication />
      ) : (
        <form className={styles.card} onSubmit={handleSubmit}>
          <p className={styles.chooseUsername}>Choose your username :</p>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="off"
            error={error}
          />
          <button type="submit" className={styles.saveButton}>
            Save
          </button>
        </form>
      )}
    </div>
  );
}
