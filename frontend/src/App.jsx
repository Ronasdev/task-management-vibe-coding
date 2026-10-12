import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './components/RouteGuards';
import AppLayout from './components/AppLayout';
import { FullPageLoader } from './components/ui';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Pages privées chargées à la demande
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
