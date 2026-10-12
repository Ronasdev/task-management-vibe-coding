import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">La page que vous cherchez n’existe pas ou a été déplacée.</p>
      <Link to="/" className="mt-8 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
        Retour à l’accueil
      </Link>
    </div>
  );
}
