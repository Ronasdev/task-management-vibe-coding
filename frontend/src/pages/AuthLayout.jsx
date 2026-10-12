import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const perks = [
  'Organisez vos tâches par statut et priorité',
  'Suivez votre progression en un coup d’œil',
  'Ne ratez plus aucune échéance',
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <Link to="/" className="relative">
          <Logo />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Concentrez-vous sur ce qui compte vraiment.</h2>
          <ul className="mt-8 space-y-4">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link to="/" className="lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
