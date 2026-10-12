import { Check } from 'lucide-react';

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
      <span className="text-lg">TaskFlow</span>
    </span>
  );
}
