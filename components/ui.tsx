import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(124,255,107,0.9)]" />
      {children}
    </div>
  );
}

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  href?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({ variant = 'primary', href, className, children, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black';
  const styles = {
    primary:
      'bg-emerald-300 text-black shadow-[0_0_34px_rgba(124,255,107,0.28)] hover:translate-y-[-1px] hover:bg-emerald-200',
    secondary:
      'border border-white/10 bg-white/5 text-white hover:border-emerald-300/30 hover:bg-white/10',
    ghost: 'text-zinc-200 hover:bg-white/5 hover:text-white',
  } as const;

  if (href) {
    return (
      <a href={href} className={joinClasses(base, styles[variant], className)} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={joinClasses(base, styles[variant], className)} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses('glass-panel rounded-3xl border p-6', className)} {...props} />;
}

export function Metric({ label, value, tone = 'emerald' }: { label: string; value: string; tone?: 'emerald' | 'cyan' | 'amber' | 'rose' }) {
  const toneClasses = {
    emerald: 'text-emerald-200',
    cyan: 'text-cyan-200',
    amber: 'text-amber-200',
    rose: 'text-rose-200',
  } as const;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">{label}</div>
      <div className={joinClasses('mt-2 text-2xl font-semibold', toneClasses[tone])}>{value}</div>
    </div>
  );
}