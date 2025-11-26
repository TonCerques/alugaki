import React from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', animated = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${animated ? 'animate-glow' : ''}`}>
      <div className={`relative flex items-center justify-center rounded-full bg-surface border border-primary/30 p-4 ${animated ? 'animate-bounce' : ''}`}>
        <Zap className={`${sizeClasses[size]} text-primary fill-current`} />
        <div className="absolute inset-0 rounded-full bg-primary opacity-20 blur-xl"></div>
      </div>
      {size !== 'sm' && (
        <h1 className={`mt-4 font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary ${textSizes[size]}`}>
          Alugaki
        </h1>
      )}
    </div>
  );
};

export default Logo;