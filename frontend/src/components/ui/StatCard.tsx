import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface StatCardProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Value to display */
  value: string | number;
  /** Label below the value */
  label: string;
  /** Color theme - maps to Tailwind colors */
  color: 'orange' | 'green' | 'purple' | 'blue' | 'yellow' | 'red' | 'primary';
  /** Card variant */
  variant?: 'default' | 'compact' | 'minimal';
  /** Optional suffix for the value (e.g., %, days) */
  suffix?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const colorMap = {
  orange: {
    bg: 'bg-accent-orange/[0.08]',
    border: 'border-accent-orange/[0.12]',
    text: 'text-accent-orange',
    iconBg: 'bg-accent-orange/[0.12]',
  },
  green: {
    bg: 'bg-accent-green/[0.08]',
    border: 'border-accent-green/[0.12]',
    text: 'text-accent-green',
    iconBg: 'bg-accent-green/[0.12]',
  },
  purple: {
    bg: 'bg-accent-purple/[0.08]',
    border: 'border-accent-purple/[0.12]',
    text: 'text-accent-purple',
    iconBg: 'bg-accent-purple/[0.12]',
  },
  blue: {
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/[0.12]',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/[0.12]',
  },
  yellow: {
    bg: 'bg-accent-yellow/[0.08]',
    border: 'border-accent-yellow/[0.12]',
    text: 'text-accent-yellow',
    iconBg: 'bg-accent-yellow/[0.12]',
  },
  red: {
    bg: 'bg-accent-red/[0.08]',
    border: 'border-accent-red/[0.12]',
    text: 'text-accent-red',
    iconBg: 'bg-accent-red/[0.12]',
  },
  primary: {
    bg: 'bg-primary-500/[0.08]',
    border: 'border-primary-500/[0.12]',
    text: 'text-primary-400',
    iconBg: 'bg-primary-500/[0.12]',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  color,
  variant = 'default',
  suffix,
  onClick,
}) => {
  const colors = colorMap[color];

  if (variant === 'minimal') {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]',
          onClick && 'cursor-pointer hover:bg-white/[0.05] transition-colors'
        )}
        onClick={onClick}
      >
        <div
          className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', colors.iconBg)}
        >
          <Icon className={clsx('w-4 h-4', colors.text)} />
        </div>
        <div>
          <span className="text-lg font-semibold text-dark-100 tracking-tight">
            {value}
            {suffix}
          </span>
          <p className="text-xs text-dark-500">{label}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'flex flex-col items-center p-3 rounded-xl',
          colors.bg,
          `border ${colors.border}`,
          onClick && 'cursor-pointer hover:scale-[1.02] transition-transform'
        )}
        onClick={onClick}
      >
        <Icon className={clsx('w-4 h-4 mb-1.5', colors.text)} />
        <span className={clsx('text-lg font-semibold tracking-tight', colors.text)}>
          {value}
          {suffix}
        </span>
        <span className="text-[11px] text-dark-500 text-center">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-col items-center p-4 rounded-xl',
        colors.bg,
        `border ${colors.border}`,
        onClick && 'cursor-pointer hover:scale-[1.02] transition-transform'
      )}
      onClick={onClick}
    >
      <Icon className={clsx('w-5 h-5 mb-2', colors.text)} />
      <span className={clsx('text-2xl font-semibold tracking-tight', colors.text)}>
        {value}
        {suffix}
      </span>
      <span className="text-xs text-dark-500 text-center mt-1">{label}</span>
    </div>
  );
};

export default StatCard;
