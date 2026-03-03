import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow hover:bg-indigo-500 active:scale-[0.98]',
        microsoft:
          'bg-white text-slate-800 shadow-lg hover:bg-slate-50 active:scale-[0.98] border border-slate-200/20',
        ghost:
          'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400',
        outline:
          'border border-slate-700 bg-transparent hover:bg-slate-800/60 text-slate-300',
        destructive:
          'bg-red-600 text-white hover:bg-red-500',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
