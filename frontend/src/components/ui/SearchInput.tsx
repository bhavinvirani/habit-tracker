import React from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Whether to show clear button */
  showClear?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

const sizeClasses = {
  sm: 'pl-8 pr-3 py-1.5 text-xs',
  md: 'pl-9 pr-4 py-2 text-sm',
  lg: 'pl-10 pr-4 py-2.5 text-sm',
};

const iconSizes = {
  sm: 14,
  md: 15,
  lg: 16,
};

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  size = 'md',
  className,
  showClear = true,
  autoFocus = false,
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={clsx('relative', className)}>
      <Search
        size={iconSizes[size]}
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 text-dark-600',
          size === 'sm' ? 'left-2.5' : 'left-3'
        )}
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        className={clsx(
          'w-full bg-dark-950 border border-white/[0.08] rounded-lg text-dark-200 placeholder-dark-600',
          'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'transition-all duration-150',
          sizeClasses[size],
          showClear && value && 'pr-9'
        )}
      />
      {showClear && value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-600 hover:text-dark-300 transition-colors"
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
