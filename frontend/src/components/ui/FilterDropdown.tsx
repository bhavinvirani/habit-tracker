import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface FilterOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface FilterDropdownProps<T = string> {
  /** Currently selected value */
  value: T | null;
  /** Change handler */
  onChange: (value: T | null) => void;
  /** Available options */
  options: FilterOption<T>[];
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Whether to show "All" option */
  showAllOption?: boolean;
  /** Label for "All" option */
  allLabel?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
  /** Icon to show before label */
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
};

function FilterDropdown<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  showAllOption = true,
  allLabel = 'All',
  size = 'md',
  className,
  icon,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel =
    selectedOption?.label || (value === null && showAllOption ? allLabel : placeholder);

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={clsx(
          'flex items-center rounded-lg transition-all duration-150',
          'bg-dark-950 border border-white/[0.08] text-dark-200',
          'hover:border-white/[0.12]',
          isOpen && 'border-primary-500/50 ring-2 ring-primary-500/20',
          sizeClasses[size]
        )}
      >
        {icon}
        <span className={clsx(!value && 'text-dark-500')}>{displayLabel}</span>
        <ChevronDown
          size={14}
          className={clsx('text-dark-600 transition-transform ml-auto', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-20 mt-1.5 min-w-full w-max bg-dark-900 border border-white/[0.08] rounded-lg shadow-elevated overflow-hidden animate-fade-in"
        >
          {showAllOption && (
            <button
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors',
                value === null
                  ? 'bg-primary-500/[0.12] text-primary-400'
                  : 'text-dark-300 hover:bg-white/[0.04]'
              )}
            >
              <span>{allLabel}</span>
              {value === null && <Check size={14} />}
            </button>
          )}
          {options.map((option) => (
            <button
              role="option"
              aria-selected={value === option.value}
              key={String(option.value)}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3.5 py-2 text-sm transition-colors',
                value === option.value
                  ? 'bg-primary-500/[0.12] text-primary-400'
                  : 'text-dark-300 hover:bg-white/[0.04]'
              )}
            >
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
              {value === option.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
