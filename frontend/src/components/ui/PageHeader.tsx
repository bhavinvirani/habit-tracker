import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Optional action button */
  action?: React.ReactNode;
  /** Additional content to render on the right side */
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary-500/[0.12] flex items-center justify-center">
            <Icon className="w-[18px] h-[18px] text-primary-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-dark-100 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-dark-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {action}
      </div>
    </div>
  );
};

export default PageHeader;
