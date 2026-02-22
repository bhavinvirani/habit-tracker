import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Badge variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'custom';
  /** Custom color (hex or CSS color) - only used with variant="custom" */
  color?: string;
  /** Size of the badge */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
}

const variantClasses = {
  default: 'bg-white/[0.06] text-dark-400',
  primary: 'bg-primary-500/15 text-primary-400',
  success: 'bg-accent-green/15 text-accent-green',
  warning: 'bg-accent-orange/15 text-accent-orange',
  danger: 'bg-accent-red/15 text-accent-red',
  custom: '',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  color,
  size = 'sm',
  className,
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  if (variant === 'custom' && color) {
    return (
      <span
        className={clsx(baseClasses, sizeClasses[size], className)}
        style={{ backgroundColor: `${color}18`, color }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
};

export default Badge;

// Preset badges for common use cases
export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const categoryColors: Record<string, string> = {
    Health: '#60a5fa',
    Fitness: '#34d399',
    Learning: '#fbbf24',
    Productivity: '#f87171',
    Mindfulness: '#a78bfa',
    Social: '#f472b6',
    Finance: '#2dd4bf',
    Other: '#71717a',
  };

  const color = categoryColors[category] || categoryColors.Other;

  return (
    <Badge variant="custom" color={color}>
      {category}
    </Badge>
  );
};

export const FrequencyBadge: React.FC<{ frequency: string }> = ({ frequency }) => {
  return <Badge variant="primary">{frequency.charAt(0) + frequency.slice(1).toLowerCase()}</Badge>;
};
