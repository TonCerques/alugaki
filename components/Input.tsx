import React from 'react';
import { InputType } from '../types';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type?: InputType;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`
            w-full bg-surface text-white rounded-xl border px-4 py-3 outline-none transition-all duration-300
            placeholder:text-gray-600
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
              : 'border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:border-gray-600'}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 ml-1 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;