import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, ListTodo, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const nav = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/tasks', label: 'Mes tâches', icon: ListTodo },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-950/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative h-full w-72 max-w-[85%] animate-slide-in bg-white shadow-xl dark:bg-slate-900">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Barre supérieure mobile */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout().catch(() => {});
    toast.success('À bientôt !');
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ?.split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-2 hidden items-center justify-between px-3 lg:flex">
          <span className="text-xs font-medium text-slate-500">Thème</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
