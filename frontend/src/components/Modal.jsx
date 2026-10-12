import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus le premier champ du panneau
    requestAnimationFrame(() => {
      panelRef.current?.querySelector('input, textarea, select, button:not([data-close])')?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          'relative flex max-h-[92vh] w-full animate-scale-in flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-2xl',
          size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            data-close
            onClick={onClose}
            className="-mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
