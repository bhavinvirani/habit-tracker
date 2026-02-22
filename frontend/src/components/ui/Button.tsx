import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon */
  icon?: LucideIcon;
  /** Icon only mode (circular button) */
  iconOnly?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white border-transparent shadow-sm',
  secondary: 'bg-white/[0.06] hover:bg-white/[0.1] text-dark-200 border-white/[0.08] hover:border-white/[0.12]',
  ghost: 'bg-transparent hover:bg-white/[0.06] text-dark-400 hover:text-dark-200 border-transparent',
  danger: 'bg-accent-red/10 hover:bg-accent-red/[0.15] text-accent-red border-accent-red/[0.15]',
  success: 'bg-accent-green/10 hover:bg-accent-green/[0.15] text-accent-green border-accent-green/[0.15]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

const iconOnlySizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950',
        variantClasses[variant],
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'active:scale-[0.98]',
        className
      )}
    >
      {loading ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : Icon ? (
        <Icon size={iconSizes[size]} />
      ) : null}
      {!iconOnly && children}
    </button>
  );
};

export default Button;
