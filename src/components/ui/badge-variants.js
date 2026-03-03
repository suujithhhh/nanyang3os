import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-indigo-600/20 text-indigo-300',
        success: 'border-transparent bg-emerald-600/20 text-emerald-300',
        warning: 'border-transparent bg-amber-600/20 text-amber-300',
        danger: 'border-transparent bg-red-600/20 text-red-300',
        outline: 'border-slate-700 text-slate-400',
        sky: 'border-transparent bg-sky-600/20 text-sky-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
