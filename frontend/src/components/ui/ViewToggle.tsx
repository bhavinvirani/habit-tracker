import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface ViewOption<T = string> {
  id: T;
  icon: LucideIcon;
  label: string;
}

interface ViewToggleProps<T = string> {
  /** Currently selected view */
  value: T;
  /** Change handler */
  onChange: (value: T) => void;
  /** Available view options */
  options: ViewOption<T>[];
  /** Whether to show labels */
  showLabels?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

function ViewToggle<T extends string>({
  value,
  onChange,
  options,
  showLabels = true,
  size = 'md',
}: ViewToggleProps<T>) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-white/[0.04] border border-white/[0.06] rounded-lg">
      {options.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={clsx(
            'flex items-center gap-1.5 rounded-md font-medium transition-all duration-150',
            size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs',
            value === id
              ? 'bg-white/[0.1] text-dark-100 shadow-sm'
              : 'text-dark-500 hover:text-dark-300 hover:bg-white/[0.04]'
          )}
        >
          <Icon size={size === 'sm' ? 13 : 14} />
          {showLabels && <span className="hidden sm:inline">{label}</span>}
        </button>
      ))}
    </div>
  );
}

export default ViewToggle;
