import { useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { createPlatformApi } from './services/platformApi';
import type { LoginInput, User } from './types/platform';
import { clearSessionUser, loadSessionUser, saveSessionUser } from './utils/session';

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const api = useMemo(() => createPlatformApi(), []);
  const [user, setUser] = useState<User | null>(() => loadSessionUser());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginInput) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const loggedInUser = await api.login(credentials);
      setUser(loggedInUser);
      saveSessionUser(loggedInUser);
      navigate('/app');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    clearSessionUser();
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage isAuthenticated={Boolean(user)} />} />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/app" replace />
          ) : (
            <LoginPage onLogin={handleLogin} loading={authLoading} error={authError} />
          )
        }
      />
      <Route
        path="/app"
        element={
          user ? (
            <WorkspacePage user={user} api={api} onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
