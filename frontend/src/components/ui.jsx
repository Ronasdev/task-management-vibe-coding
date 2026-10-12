import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500/40 disabled:hover:bg-brand-600',
  secondary:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/40',
};

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition',
        'focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export const Field = ({ label, htmlFor, error, hint, children }) => (
  <div>
    {label && (
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    )}
  </div>
);

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return <input ref={ref} className={clsx('input', error && 'input-error', className)} aria-invalid={!!error} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea ref={ref} className={clsx('input resize-y', error && 'input-error', className)} aria-invalid={!!error} {...props} />
  );
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={clsx('input cursor-pointer pr-9', className)} {...props}>
      {children}
    </select>
  );
});

export const Badge = ({ className, children }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
      className
    )}
  >
    {children}
  </span>
);

export const Spinner = ({ className }) => (
  <Loader2 className={clsx('animate-spin text-brand-600', className ?? 'h-6 w-6')} aria-label="Chargement" />
);

export const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner className="h-8 w-8" />
  </div>
);

export const Skeleton = ({ className }) => (
  <div className={clsx('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800', className)} />
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <Icon className="h-7 w-7" />
      </div>
    )}
    <h3 className="text-base font-semibold">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
