
import React, { useState } from 'react';
import { X, Check, Home, PlusSquare, MessageSquare, ChevronRight } from 'lucide-react';
import Button from './Button';

interface TutorialOverlayProps {
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [step, setStep] = useState(0); // 0 = Confirm, 1+ = Steps

  const steps = [
    {
      id: 1,
      target: 'Explore',
      title: 'Explore Equipamentos',
      text: 'Encontre câmeras, drones e luzes próximos a você.',
      icon: <Home size={24} />,
      position: 'bottom-left'
    },
    {
      id: 2,
      target: 'Publish',
      title: 'Anuncie e Ganhe',
      text: 'Tem equipamento parado? Publique em segundos e faça renda extra.',
      icon: <PlusSquare size={24} />,
      position: 'bottom-center'
    },
    {
      id: 3,
      target: 'Chat',
      title: 'Negocie com Segurança',
      text: 'Converse, aprove reservas e combine a entrega, tudo por aqui.',
      icon: <MessageSquare size={24} />,
      position: 'bottom-right'
    }
  ];

  const handleStart = () => setStep(1);
  
  const handleNext = () => {
    if (step < steps.length) {
      setStep(s => s + 1);
    } else {
      onClose();
    }
  };

  // STEP 0: Confirmation Modal
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-[#1E1E24] rounded-2xl p-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.2)] max-w-sm w-full text-center relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🎓</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao Alugaki!</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Gostaria de um tour rápido para aprender como alugar e anunciar seus equipamentos?
          </p>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} fullWidth className="text-sm">
              Agora não
            </Button>
            <Button onClick={handleStart} fullWidth className="text-sm">
              Sim, mostrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // TUTORIAL STEPS
  const currentStep = steps[step - 1];
  
  // Position logic mainly targets the bottom nav area
  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case 'bottom-left': return 'bottom-24 left-4';
      case 'bottom-center': return 'bottom-24 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-24 right-4';
      default: return 'bottom-24 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* Darken background slightly focus attention */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={handleNext}></div>

      {/* Tooltip Card */}
      <div 
        className={`absolute ${getPositionClasses(currentStep.position)} bg-surface border border-primary/30 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] w-64 pointer-events-auto animate-bounce-slight transition-all duration-300`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {currentStep.icon}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">{currentStep.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{currentStep.text}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-1">
            {steps.map(s => (
              <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${s.id === step ? 'bg-primary' : 'bg-gray-700'}`}></div>
            ))}
          </div>
          <button 
            onClick={handleNext} 
            className="text-xs text-white bg-primary hover:bg-primary/80 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
          >
            {step === steps.length ? 'Concluir' : 'Próximo'}
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Arrow pointer */}
        <div className={`absolute -bottom-2 w-4 h-4 bg-surface border-b border-r border-primary/30 transform rotate-45 ${currentStep.position === 'bottom-center' ? 'left-1/2 -translate-x-1/2' : currentStep.position === 'bottom-left' ? 'left-6' : 'right-6'}`}></div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
