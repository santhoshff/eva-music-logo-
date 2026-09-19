import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface VanishInputProps {
  placeholder?: string;
  placeholders?: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  type?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
}

export const VanishInput: React.FC<VanishInputProps> = ({
  placeholder = 'yo@gxuri.me',
  placeholders = [
    'yo@gxuri.me',
    'samantha@evamusic.app',
    'your.email@gmail.com',
    'synthwave@beats.io',
    'listener@cosmic.fm'
  ],
  value,
  onChange,
  onSubmit,
  type = 'text',
  disabled = false,
  icon,
  autoComplete,
  required = false
}) => {
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePlaceholders = placeholders && placeholders.length > 0 ? placeholders : [placeholder];

  useEffect(() => {
    if (value || isFocused) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentPlaceholderIndex((prev) => (prev + 1) % activePlaceholders.length);
        setIsFading(false);
      }, 350);
    }, 3200);

    return () => clearInterval(interval);
  }, [value, isFocused, activePlaceholders.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full flex items-center rounded-2xl bg-white/80 backdrop-blur-xl border transition-all duration-300 shadow-sm ${
        isFocused
          ? 'border-purple-500 ring-4 ring-purple-500/15 bg-white shadow-md'
          : 'border-white/90 hover:border-purple-300/80 hover:bg-white/95'
      }`}
    >
      {/* Optional Leading Icon */}
      {icon && (
        <div className="pl-3.5 pr-1 text-purple-600 flex items-center justify-center flex-none">
          {icon}
        </div>
      )}

      {/* Input container with animated vanishing placeholder */}
      <div className="relative flex-1 py-3 px-3">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-transparent focus:outline-none z-10 relative"
        />

        {/* Vanishing / Sliding Animated Placeholder */}
        {!value && (
          <div
            onClick={() => inputRef.current?.focus()}
            className={`absolute inset-0 flex items-center pl-3 pr-2 text-xs sm:text-sm font-medium text-slate-400 pointer-events-none select-none transition-all duration-300 ${
              isFading
                ? 'opacity-0 -translate-y-1.5 filter blur-[1px]'
                : 'opacity-100 translate-y-0 filter blur-0'
            }`}
          >
            <span className="truncate">{activePlaceholders[currentPlaceholderIndex]}</span>
          </div>
        )}
      </div>

      {/* Submit / Action Arrow Button */}
      {onSubmit && (
        <button
          type="submit"
          disabled={disabled || !value}
          className={`mr-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer flex-none ${
            value
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
          }`}
          aria-label="Submit input"
        >
          <ArrowRight size={15} />
        </button>
      )}
    </form>
  );
};
