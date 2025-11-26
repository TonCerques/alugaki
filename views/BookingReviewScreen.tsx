
import React, { useState } from 'react';
import { ArrowLeft, Shield, Info, CreditCard, Calendar, Check } from 'lucide-react';
import Button from '../components/Button';
import { itemTable, bookingTable } from '../lib/db';
import { Profile } from '../types';

interface BookingReviewScreenProps {
  itemId: string;
  startDate: string;
  endDate: string;
  currentUser: Profile;
  onBack: () => void;
  onConfirm: (chatRoomId: string) => void;
}

const BookingReviewScreen: React.FC<BookingReviewScreenProps> = ({ itemId, startDate, endDate, currentUser, onBack, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const item = itemTable.findById(itemId);
  
  if (!item) return null;

  // Safe Date Calculation
  let start = new Date(startDate);
  let end = new Date(endDate);
  
  if (isNaN(start.getTime())) start = new Date();
  if (isNaN(end.getTime())) end = new Date();

  // Calculate difference in days (inclusive)
  const diffTime = Math.abs(end.getTime() - start.getTime());
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  if (diffDays <= 0) diffDays = 1; 
  diffDays = diffDays + 1; // Inclusive logic

  const itemTotal = item.dailyPrice * diffDays;
  const serviceFee = Math.round(itemTotal * 0.10); // 10% fee
  const total = itemTotal + serviceFee;
  const deposit = Math.round(item.replacementValue * 0.2);

  const handleConfirm = async () => {
    if (!acceptedTerms) return;
    setLoading(true);

    try {
      // Simulate API network latency
      await new Promise(r => setTimeout(r, 1200));

      const { chatRoomId } = bookingTable.create({
        itemId: item.id,
        renterId: currentUser.id,
        ownerId: item.ownerId,
        startDate: startDate,
        endDate: endDate,
        totalPrice: total,
        depositAmount: deposit,
      });

      onConfirm(chatRoomId);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-background flex flex-col p-4 animate-fade-in-up overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pt-2 shrink-0">
        <button onClick={onBack} className="p-2 rounded-full bg-surface border border-gray-700 hover:bg-gray-700 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Revisar Solicitação</h1>
      </div>

      <div className="flex-1 pb-24">
        {/* Item Summary */}
        <div className="bg-surface rounded-xl overflow-hidden border border-gray-800 shadow-md mb-6">
          <div className="flex gap-4 p-4">
            <img src={item.images[0]} className="w-24 h-24 rounded-lg object-cover bg-gray-900" alt="Item" />
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-white font-bold mb-1 line-clamp-2">{item.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Calendar size={12} className="text-primary" />
                <span>{start.toLocaleDateString('pt-BR')} - {end.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium w-fit">
                 {diffDays} Dias
              </div>
            </div>
          </div>
          {/* Item Description Context */}
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 line-clamp-2 italic border-t border-gray-700/50 pt-2">
               "{item.description}"
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Detalhes do Pagamento</h3>
        <div className="bg-surface rounded-xl p-5 border border-gray-800 space-y-3 mb-6">
          <div className="flex justify-between text-sm text-gray-300">
            <span>R$ {item.dailyPrice} x {diffDays} dias</span>
            <span>R$ {itemTotal}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>Taxa de Serviço (10%)</span>
            <span>R$ {serviceFee}</span>
          </div>
          <div className="h-px bg-gray-700 my-2"></div>
          <div className="flex justify-between font-bold text-white text-lg">
            <span>Total</span>
            <span className="text-primary">R$ {total}</span>
          </div>
        </div>

        {/* Deposit Warning */}
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Caução de Segurança</h3>
        <div className="bg-[#1E1E24] border border-gray-700 p-4 rounded-xl flex gap-3 mb-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <CreditCard className="text-blue-500 shrink-0 mt-1" size={20} />
          <div>
            <p className="text-white font-bold text-sm">Bloqueio: R$ {deposit}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Este valor é apenas <strong>pré-autorizado</strong> no seu cartão. Ele será liberado 48h após a devolução segura do item.
            </p>
          </div>
        </div>

        {/* Insurance & Contract */}
        <div 
          className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer mb-8 ${acceptedTerms ? 'bg-primary/5 border-primary/50' : 'bg-surface border-gray-800'}`} 
          onClick={() => setAcceptedTerms(!acceptedTerms)}
        >
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${acceptedTerms ? 'bg-primary border-primary' : 'border-gray-500'}`}>
            {acceptedTerms && <Check size={14} className="text-white" />}
          </div>
          <p className="text-xs text-gray-300 select-none leading-relaxed">
            Concordo com os <span className="text-primary font-bold">Termos de Serviço</span> e confirmo que possuo documento válido condizente com meu perfil.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-800 z-50">
        <Button 
          fullWidth 
          onClick={handleConfirm} 
          disabled={!acceptedTerms} 
          isLoading={loading}
          className={acceptedTerms ? 'shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''}
        >
          Enviar Solicitação (R$ {total})
        </Button>
      </div>
    </div>
  );
};

export default BookingReviewScreen;
