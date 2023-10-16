import { FC } from 'react';
import { Router } from './core/router/Router';
import { AuthProvider } from './core/providers/AuthProvider';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './styles/theme';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import { ErrorPage } from './pages/ErrorPage/ErrorPage';

export const App: FC = () => {
  return (
    <main>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer theme="colored" autoClose={2000} />
        <ErrorBoundary fallback={<ErrorPage />}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </main>
  );
};

export default App;
