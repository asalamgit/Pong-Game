import { JSX } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { ChatSocketProvider } from '../providers/ChatSocketProvider';
import { GameSocketProvider } from '../providers/GameSocketProvider';
import { UserProvider } from '../providers/UserProvider';
import { FriendsSocketProvider } from '../providers/FriendsSocketProvider';

type Props = {
  isAuthenticated?: boolean;
};

export function AuthenticatedRoute({
  isAuthenticated = true,
}: Props): JSX.Element {
  const { auth } = useAuth();

  if (isAuthenticated && !auth?.accessToken)
    return <Navigate to="/register" replace={true} />;

  if (!isAuthenticated && auth?.accessToken)
    return <Navigate to="/game" replace={true} />;

  return isAuthenticated ? (
    <ChatSocketProvider>
      <GameSocketProvider>
        <FriendsSocketProvider>
          <UserProvider>
            <Outlet />
          </UserProvider>
        </FriendsSocketProvider>
      </GameSocketProvider>
    </ChatSocketProvider>
  ) : (
    <Outlet />
  );
}
