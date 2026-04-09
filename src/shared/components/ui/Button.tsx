import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'ghost-primary' | 'ghost-danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-canvas font-semibold rounded-xl transition-[background-color,border-color] duration-150 border-2 border-transparent enabled:hover:bg-primary-dark enabled:active:border-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus-visible:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  'ghost-primary':
    'text-sm font-semibold text-primary px-3 py-1 rounded-md transition-colors duration-150 hover:bg-primary/10 shrink-0  cursor-pointer',
  'ghost-danger':
    'text-fg-muted rounded-md transition-[color,background-color] duration-150 hover:text-error hover:bg-error/8  cursor-pointer',
  ghost: 'text-fg-muted rounded-md transition-colors duration-150 hover:text-fg cursor-pointer',
};

export function Button({ variant = 'ghost-primary', className, ...props }: ButtonProps) {
  return <button className={twMerge(clsx(variantClasses[variant], className))} {...props} />;
}
