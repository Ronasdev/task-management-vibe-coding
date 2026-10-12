import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { Button, Field, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../api/client';

const rules = [
  { label: '8 caractères minimum', test: (p) => p.length >= 8 },
  { label: 'Une majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p) => /\d/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (values.name.trim().length < 2) errs.name = 'Le nom doit contenir au moins 2 caractères';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = 'Adresse e-mail invalide';
    if (!rules.every((r) => r.test(values.password))) errs.password = 'Le mot de passe ne respecte pas les critères';
    if (values.confirm !== values.password) errs.confirm = 'Les mots de passe ne correspondent pas';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setFormError('');
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      toast.success('Bienvenue sur TaskFlow !');
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, 'Inscription impossible'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Gratuit, sans carte bancaire. Prêt en 30 secondes."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400" role="alert">
            {formError}
          </div>
        )}
        <Field label="Nom complet" htmlFor="name" error={errors.name}>
          <Input id="name" autoComplete="name" placeholder="Marie Dupont" value={values.name} onChange={set('name')} error={errors.name} />
        </Field>
        <Field label="Adresse e-mail" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={values.email}
            onChange={set('email')}
            error={errors.email}
          />
        </Field>
        <Field label="Mot de passe" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password}
            onChange={set('password')}
            error={errors.password}
          />
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {rules.map((r) => {
              const ok = r.test(values.password);
              return (
                <li key={r.label} className={clsx('flex items-center gap-1.5 text-xs', ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}>
                  <Check className={clsx('h-3.5 w-3.5', !ok && 'opacity-40')} />
                  {r.label}
                </li>
              );
            })}
          </ul>
        </Field>
        <Field label="Confirmer le mot de passe" htmlFor="confirm" error={errors.confirm}>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Créer mon compte
        </Button>
      </form>
    </AuthLayout>
  );
}
