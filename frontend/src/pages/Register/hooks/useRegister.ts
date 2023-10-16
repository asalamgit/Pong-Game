import { PASSWORD_REGEX } from '@/core/constants';
import { useLogin } from '@/core/hooks/useLogin';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const credentialsSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(8).max(128).regex(PASSWORD_REGEX, {
    message:
      'Password must contain at least 1 Uppercase, 1 Lowercase, 1 digit and 1 special character',
  }),
});

type Credentials = z.infer<typeof credentialsSchema>;

type AxiosError = {
  error: string;
  message: string;
  statusCode: number;
};

type RegisterValues = {
  type: 'signin' | 'signup';
};

export function useRegister({ type }: RegisterValues) {
  const { login } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    reset();
  }, [reset, type]);

  const onSubmit = async (data: Credentials) => {
    try {
      await login({
        type,
        data,
      });
      navigate('/game');
    } catch (err) {
      if (axios.isAxiosError<AxiosError>(err) && err.response?.data) {
        setError('root.serverError', {
          type: String(err.response.data.statusCode),
          message: err.response.data.message,
        });
      } else {
        setError('root.serverError', {
          type: '500',
          message:
            'Oops! It seems our server is currently experiencing some technical difficulties',
        });
      }
    }
  };

  return { register, handleSubmit: handleSubmit(onSubmit), errors };
}
