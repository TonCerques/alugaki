
import React, { useState } from 'react';
import { ScanFace, ShieldCheck, CreditCard, LockOpen, ChevronRight, Zap } from 'lucide-react';
import Button from '../components/Button';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      id: 0,
      title: "Bem-vindo ao Alugaki",
      description: "A comunidade onde seus equipamentos rendem lucro e sua criatividade não tem limites.",
      icon: <Zap size={64} className="text-primary" fill="currentColor" />,
      color: "primary",
      gradient: "from-violet-600/30 to-indigo-900/30",
      glow: "shadow-[0_0_60px_rgba(139,92,246,0.6)]"
    },
    {
      id: 1,
      title: "Confiança Real",
      description: "Aqui, todos são reais. Validamos a identidade de 100% dos membros para sua segurança.",
      icon: <ScanFace size={64} className="text-cyan-400" />,
      color: "cyan",
      gradient: "from-cyan-500/20 to-blue-600/20",
      glow: "shadow-[0_0_50px_rgba(34,211,238,0.4)]"
    },
    {
      id: 2,
      title: "Proteção Total",
      description: "Alugue sem medo. Seus itens contam com proteção contra danos e roubo durante a locação.",
      icon: <ShieldCheck size={64} className="text-purple-400" />,
      color: "purple",
      gradient: "from-purple-500/20 to-pink-600/20",
      glow: "shadow-[0_0_50px_rgba(168,85,247,0.4)]"
    },
    {
      id: 3,
      title: "Caução Inteligente",
      description: "Bloqueamos o valor no cartão do locatário temporariamente, sem cobrar na hora.",
      icon: (
        <div className="relative">
          <CreditCard size={64} className="text-white" />
          <div className="absolute -top-3 -right-3 bg-background rounded-full p-1 border border-green-500">
            <LockOpen size={24} className="text-green-500" />
          </div>
        </div>
      ),
      color: "green",
      gradient: "from-emerald-500/20 to-green-600/20",
      glow: "shadow-[0_0_50px_rgba(16,185,129,0.4)]"
    }
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchZone = (zone: 'left' | 'right') => {
    if (zone === 'left') handlePrev();
    else handleNext();
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50 overflow-hidden">
      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentIndex].gradient} transition-all duration-700`}></div>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>

      {/* Touch Zones (Like Instagram Stories) */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full z-10" onClick={() => handleTouchZone('left')}></div>
        <div className="w-2/3 h-full z-10" onClick={() => handleTouchZone('right')}></div>
      </div>

      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex gap-2 safe-top">
        {slides.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-full opacity-100' : 
                idx < currentIndex ? 'w-full opacity-50' : 'w-0'
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-20 relative pointer-events-none">
        {/* 3D Icon Container */}
        <div className="mb-12 relative animate-pulse-fast">
          <div className={`w-40 h-40 rounded-[30px] bg-surface/80 backdrop-blur-xl border border-white/10 flex items-center justify-center ${slides[currentIndex].glow} transition-all duration-500`}>
             <div className="transform scale-125 transition-all duration-500">
               {slides[currentIndex].icon}
             </div>
          </div>
          {/* Reflection Glare */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>

        {/* Text */}
        <div className="text-center transition-all duration-500 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            {slides[currentIndex].title}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-xs mx-auto">
            {slides[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="p-6 pb-8 z-30 safe-bottom">
        {currentIndex === slides.length - 1 ? (
          <Button 
            fullWidth 
            className="h-14 text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-fade-in-up"
            onClick={onFinish}
          >
            Começar Agora
          </Button>
        ) : (
          <div className="flex justify-end animate-fade-in">
             <button 
               onClick={handleNext}
               className="bg-surface/50 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium hover:bg-white/10 transition-colors"
             >
               Próximo <ChevronRight size={18} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
