import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarClock, Layers, Lock, Smartphone, Zap } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Layers, title: 'Statuts clairs', text: 'À faire, en cours, terminée : visualisez où en est chaque tâche.' },
  { icon: Zap, title: 'Priorités', text: 'Classez vos tâches par importance et traitez l’essentiel d’abord.' },
  { icon: CalendarClock, title: 'Échéances', text: 'Repérez instantanément les tâches en retard ou à venir.' },
  { icon: BarChart3, title: 'Tableau de bord', text: 'Statistiques et taux de complétion pour suivre vos progrès.' },
  { icon: Smartphone, title: 'Partout', text: 'Interface adaptative, du smartphone au grand écran.' },
  { icon: Lock, title: 'Sécurisé', text: 'Authentification JWT, mots de passe chiffrés, sessions révocables.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Mon espace
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Connexion
                </Link>
                <Link to="/register" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  S’inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[500px] max-w-4xl rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/10" />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Simple. Rapide. Efficace.
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Vos tâches,{' '}
            <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">enfin sous contrôle</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            TaskFlow vous aide à planifier, prioriser et accomplir votre travail. Un outil épuré qui vous laisse vous concentrer sur l’essentiel.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-medium text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
            >
              {isAuthenticated ? 'Accéder à mon espace' : 'Commencer gratuitement'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="inline-flex h-12 items-center rounded-xl px-6 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
                J’ai déjà un compte
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} TaskFlow. Tous droits réservés.
      </footer>
    </div>
  );
}
