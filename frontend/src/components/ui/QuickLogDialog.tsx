import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface QuickLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: number, completed: boolean) => void;
  habitName: string;
  habitIcon: string | null;
  habitColor: string;
  currentValue: number;
  targetValue: number;
  unit: string | null;
  loading?: boolean;
}

function getQuickAddButtons(target: number): number[] {
  if (target <= 10) return [1, 2, 5];
  if (target <= 30) return [1, 5, 10];
  return [5, 10, 15];
}

const QuickLogDialog: React.FC<QuickLogDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  habitName,
  habitIcon,
  habitColor,
  currentValue,
  targetValue,
  unit,
  loading = false,
}) => {
  const [customValue, setCustomValue] = useState(currentValue);
  const [showCustom, setShowCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomValue(currentValue);
      setShowCustom(false);
    }
  }, [isOpen, currentValue]);

  useEffect(() => {
    if (showCustom) {
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [showCustom]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && showCustom && customValue !== currentValue) {
        e.preventDefault();
        onSubmit(customValue, customValue >= targetValue);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSubmit, showCustom, customValue, currentValue, targetValue]);

  if (!isOpen) return null;

  const quickAddButtons = getQuickAddButtons(targetValue);
  const remaining = targetValue - currentValue;
  const progress = Math.min((currentValue / targetValue) * 100, 100);

  const handleQuickAdd = (amount: number) => {
    const newValue = currentValue + amount;
    onSubmit(newValue, newValue >= targetValue);
  };

  const handleComplete = () => {
    onSubmit(targetValue, true);
  };

  const handleIncrement = (amount: number) => {
    setCustomValue((prev) => Math.max(0, prev + amount));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setCustomValue(0);
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      setCustomValue(num);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue !== currentValue) {
      onSubmit(customValue, customValue >= targetValue);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-log-title"
        className="relative bg-dark-900 border border-white/[0.06] rounded-2xl shadow-elevated w-full max-w-sm mx-4 p-5 animate-scale-in"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-dark-600 hover:text-dark-300 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h3 id="quick-log-title" className="text-base font-semibold text-dark-100 flex items-center gap-2">
            {habitIcon && <span>{habitIcon}</span>}
            {habitName}
          </h3>
          <p className="text-xs text-dark-500 mt-0.5">
            {currentValue} / {targetValue} {unit || ''}{' '}
            <span className="text-dark-600">({remaining} left)</span>
          </p>
        </div>

        <div className="mb-5">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: habitColor }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {quickAddButtons.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              disabled={loading}
              className="py-2.5 rounded-xl bg-white/[0.06] text-sm font-medium text-dark-200 hover:bg-white/[0.1] active:scale-[0.98] transition-all border border-white/[0.04]"
            >
              +{amount} {unit || ''}
            </button>
          ))}
          <button
            onClick={handleComplete}
            disabled={loading}
            className="py-2.5 rounded-xl font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 border border-transparent"
            style={{ backgroundColor: `${habitColor}18`, color: habitColor, borderColor: `${habitColor}20` }}
          >
            <Check size={15} />
            Complete
          </button>
        </div>

        <button
          onClick={() => setShowCustom(!showCustom)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-dark-600 hover:text-dark-400 transition-colors"
        >
          Custom value
          <ChevronDown size={12} className={clsx('transition-transform', showCustom && 'rotate-180')} />
        </button>

        {showCustom && (
          <div className="mt-2 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={() => handleIncrement(-1)}
                disabled={customValue <= 0}
                className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                  customValue <= 0
                    ? 'bg-white/[0.04] text-dark-700 cursor-not-allowed'
                    : 'bg-white/[0.06] text-dark-300 hover:bg-white/[0.1] active:scale-95'
                )}
              >
                <Minus size={14} />
              </button>
              <input
                ref={inputRef}
                type="number"
                min={0}
                value={customValue}
                onChange={handleInputChange}
                className="w-20 h-9 rounded-lg bg-dark-950 border border-white/[0.08] text-center text-base font-semibold text-dark-100 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => handleIncrement(1)}
                className="w-9 h-9 rounded-lg bg-white/[0.06] text-dark-300 hover:bg-white/[0.1] active:scale-95 transition-all flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleCustomSubmit}
              disabled={loading || customValue === currentValue}
              className={clsx(
                'w-full py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2',
                customValue === currentValue
                  ? 'bg-white/[0.04] text-dark-600 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-500 active:scale-[0.98]'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                `Set to ${customValue} ${unit || ''}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default QuickLogDialog;
