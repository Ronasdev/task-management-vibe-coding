import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './ui';

/** Accessible uniquement connecté ; sinon redirige vers /login en mémorisant la destination. */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Pages de connexion / inscription : redirige vers le tableau de bord si déjà connecté. */
export function GuestRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  return <Outlet />;
}
