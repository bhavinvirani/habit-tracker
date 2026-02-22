import React from 'react';
import clsx from 'clsx';

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Whether the card is hoverable */
  hoverable?: boolean;
  /** Card padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padding = 'md',
  header,
  footer,
}) => {
  return (
    <div
      className={clsx(
        'bg-dark-900 border border-white/[0.06] rounded-xl',
        hoverable && 'hover:border-white/[0.1] hover:bg-dark-900/80 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {header && (
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

// Section header for use inside cards
interface CardSectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardSectionHeader: React.FC<CardSectionHeaderProps> = ({
  title,
  action,
  className,
}) => {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider">{title}</h3>
      {action}
    </div>
  );
};
