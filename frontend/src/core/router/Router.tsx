import { JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Game, Chat, Profile, Register } from '@/pages';
import { Layout } from '@/ui';
import { AuthenticatedRoute } from '../components/AuthenticatedRoute';
import { RegisterAdditional } from '@/pages/RegisterAdditional/RegisterAdditional';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { NotFound } from '@/pages/NotFound/NotFound';

export function Router(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthenticatedRoute />}>
          <Route element={<ProtectedRoute isProtected={false} />}>
            <Route
              path="/register/additional"
              element={<RegisterAdditional />}
            />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={<Navigate to="/game" replace={true} />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/game" element={<Game />} />
              <Route path="/chat" element={<Chat />} />
            </Route>
          </Route>
        </Route>

        <Route element={<AuthenticatedRoute isAuthenticated={false} />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Register isLogin={true} />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
