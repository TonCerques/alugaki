
import React from 'react';
import { X } from 'lucide-react';

interface CoachmarkProps {
  text: string;
  onClose: () => void;
  position: 'bottom' | 'top' | 'center';
  targetStyle?: React.CSSProperties; // Para posicionar o spotlight manualmente se necessário
}

const Coachmark: React.FC<CoachmarkProps> = ({ text, onClose, position, targetStyle }) => {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col pointer-events-auto animate-fade-in">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      {/* Content Positioner */}
      <div className={`absolute w-full px-6 flex flex-col items-center ${
        position === 'bottom' ? 'bottom-24' : 
        position === 'top' ? 'top-24' : 
        'top-1/2 -translate-y-1/2'
      }`}>
        <div className="bg-surface border border-primary/50 p-5 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] max-w-sm text-center relative animation-bounce-slight">
          <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-background border border-gray-700 rounded-full p-1 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
          
          <div className="mb-2 text-2xl">💡</div>
          <p className="text-white font-medium text-sm leading-relaxed">
            {text}
          </p>
          
          <button 
            onClick={onClose}
            className="mt-4 text-xs font-bold text-primary uppercase tracking-wider hover:text-white transition-colors"
          >
            Entendi
          </button>

          {/* Arrow Pointer */}
          <div className={`absolute w-4 h-4 bg-surface border-r border-b border-primary/50 transform rotate-45 left-1/2 -translate-x-1/2 ${
            position === 'bottom' ? 'top-full -mt-2 border-t-0 border-l-0' : 
            position === 'top' ? 'bottom-full -mb-2 border-b-0 border-r-0 rotate-[225deg]' : 'hidden'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default Coachmark;
