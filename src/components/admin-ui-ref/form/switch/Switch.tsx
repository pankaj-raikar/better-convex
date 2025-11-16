'use client';
import type React from 'react';
import { useState } from 'react';

type SwitchProps = {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: 'blue' | 'gray'; // Added prop to toggle color theme
};

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = 'blue', // Default to blue color
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onChange) {
      onChange(newCheckedState);
    }
  };

  const switchColors =
    color === 'blue'
      ? {
          background: isChecked
            ? 'bg-brand-500 '
            : 'bg-gray-200 dark:bg-white/10', // Blue version
          knob: isChecked
            ? 'translate-x-full bg-white'
            : 'translate-x-0 bg-white',
        }
      : {
          background: isChecked
            ? 'bg-gray-800 dark:bg-white/10'
            : 'bg-gray-200 dark:bg-white/10', // Gray version
          knob: isChecked
            ? 'translate-x-full bg-white'
            : 'translate-x-0 bg-white',
        };

  return (
    <div
      className={`flex select-none items-center gap-3 font-medium text-sm ${
        disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-400'
      }`}
    >
      <button
        aria-checked={isChecked}
        aria-label={label}
        className={`relative h-6 w-11 rounded-full transition duration-150 ease-linear focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          disabled ? 'bg-gray-100 dark:bg-gray-800' : switchColors.background
        }`}
        disabled={disabled}
        onClick={handleToggle}
        role="switch"
        type="button"
      >
        <span className="sr-only">{label}</span>
        <span
          className={`absolute top-0.5 left-0.5 block h-5 w-5 transform rounded-full shadow-theme-sm duration-150 ease-linear ${switchColors.knob}`}
        />
      </button>
      <span>{label}</span>
    </div>
  );
};

export default Switch;
