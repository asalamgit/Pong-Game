import { useState } from 'react';
import styles from './Register.module.scss';
import { useLogin } from '@/core/hooks/useLogin';
import { Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Alert, TextField } from '@mui/material';
import { clsx } from 'clsx';
import { ReactComponent as FortyTwoLogo } from '@/assets/42.svg';
import { ReactComponent as GoogleLogo } from '@/assets/google.svg';
import { ReactComponent as FacebookLogo } from '@/assets/facebook.svg';
import { useRegister } from './hooks/useRegister';

export function Register({ isLogin = false }) {
  const { login } = useLogin();
  const type = isLogin ? 'signin' : 'signup';
  const path = isLogin ? '/register' : '/login';
  const link = isLogin ? 'Register' : 'Login';
  const { register, handleSubmit, errors } = useRegister({ type });
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>PongoGame</h1>
          {isLogin ? (
            <h2 className={styles.subtitle}>Login</h2>
          ) : (
            <>
              <h2 className={styles.subtitle}>
                Join thousands of players from around the world
              </h2>
              <p className={styles.textPresentation}>
                Master the original pong game learning the best strategies.
                There are multiple paths for you to choose
              </p>
            </>
          )}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fields}>
            <TextField
              variant="outlined"
              label="Username"
              {...register('username')}
              autoFocus
              error={!!errors.username}
              helperText={errors.username?.message ?? ''}
              autoComplete="off"
            />
            <TextField
              variant="outlined"
              label="Password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message ?? ''}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: showPassword ? (
                  <Visibility
                    onClick={handleShowPassword}
                    className={styles.passwordIcon}
                  />
                ) : (
                  <VisibilityOff
                    onClick={handleShowPassword}
                    className={styles.passwordIcon}
                  />
                ),
              }}
            />
            {errors.root?.serverError.message && (
              <Alert severity="error" color="error">
                {errors.root.serverError.message}
              </Alert>
            )}
            <button type="submit" className={styles.submit}>
              Start playing now
            </button>
          </div>
        </form>
        <div className={styles.centeredItems}>
          <p className={styles.smallerText}>
            or continue with these social profiles
          </p>
          <div className={styles.socials}>
            <FacebookLogo
              className={styles.icon}
              onClick={() => login({ type: 'facebook' })}
            />
            <GoogleLogo
              className={styles.icon}
              onClick={() => login({ type: 'google' })}
            />
            <FortyTwoLogo
              className={clsx(styles.icon, styles.fortyTwo)}
              onClick={() => login({ type: '42' })}
            />
          </div>
          <p className={styles.smallerText}>
            already a member?
            <Link className={styles.link} to={path}>
              {link}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
