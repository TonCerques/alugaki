
import React, { useEffect, useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import Button from '../components/Button';

interface RequestSuccessScreenProps {
  onGoToChat: () => void;
  onClose: () => void;
}

const RequestSuccessScreen: React.FC<RequestSuccessScreenProps> = ({ onGoToChat, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Animation Circle */}
      <div className="relative mb-8">
         <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
            <div className={`w-16 h-16 rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
               <Check size={40} className="text-white" strokeWidth={4} />
            </div>
         </div>
         {showContent && (
           <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20"></div>
         )}
      </div>

      <div className={`transition-all duration-700 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-3xl font-bold text-white mb-2">Solicitação Enviada!</h2>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">
          O proprietário foi notificado. Você pode discutir detalhes da retirada no chat enquanto aguarda a aprovação.
        </p>

        <div className="space-y-3 w-full max-w-xs mx-auto">
          <Button fullWidth onClick={onGoToChat}>
            <div className="flex items-center justify-center gap-2">
              <MessageSquare size={18} />
              Ir para o Chat
            </div>
          </Button>
          
          <Button fullWidth variant="ghost" onClick={onClose}>
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestSuccessScreen;
