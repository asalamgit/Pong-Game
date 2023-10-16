import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';

type Props = {
  isProtected?: boolean;
};

export function ProtectedRoute({ isProtected = true }: Props) {
  const { user } = useUser();
  const { auth } = useAuth();

  if (isProtected && (!user?.username || auth.needTwoFa))
    return <Navigate to="/register/additional" replace={true} />;

  if (!isProtected && user?.username && !auth.needTwoFa)
    return <Navigate to="/game" replace={true} />;
  return <Outlet />;
}
