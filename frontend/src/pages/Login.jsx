import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { Button, Field, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = 'Adresse e-mail invalide';
    if (!values.password) errs.password = 'Mot de passe requis';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setFormError('');
    try {
      await login(values);
      toast.success('Bon retour !');
      // La redirection est gérée par <GuestRoute>
    } catch (err) {
      setFormError(getErrorMessage(err, 'Connexion impossible'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Ravi de vous revoir. Connectez-vous pour accéder à vos tâches."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Créer un compte
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
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={set('password')}
            error={errors.password}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Se connecter
        </Button>
      </form>
    </AuthLayout>
  );
}
