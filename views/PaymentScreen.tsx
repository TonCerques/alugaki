
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, FileText, ChevronRight, Check } from 'lucide-react';
import Button from '../components/Button';
import { bookingTable, itemTable, profileTable, chatTable } from '../lib/db';
import { Profile } from '../types';

interface PaymentScreenProps {
  chatRoomId: string;
  currentUser: Profile;
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ chatRoomId, currentUser, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [agreedToContract, setAgreedToContract] = useState(false);

  // Use synchronous DB access since our mock DB is synchronous
  const roomData = chatTable.getRoomsByUser(currentUser.id).find((r: any) => r.id === chatRoomId);
  const bookingData = roomData ? bookingTable.findById(roomData.bookingId) : null;
  const itemData = bookingData ? itemTable.findById(bookingData.itemId) : null;
  const ownerData = bookingData ? profileTable.find(bookingData.ownerId) : null;

  if (!bookingData || !itemData || !ownerData) {
    return <div className="p-8 text-center text-white">Erro ao carregar detalhes do pagamento.</div>;
  }

  const handlePay = async () => {
    if (!agreedToContract) return;
    setLoading(true);
    
    try {
      // Simulate Payment Gateway (Stripe)
      await new Promise(r => setTimeout(r, 2000));
      
      // Call DB to confirm
      bookingTable.confirmPayment(bookingData.id, currentUser.id);
      
      onSuccess();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-background flex flex-col z-50 animate-fade-in-up overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-800 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            Checkout Seguro
            <Lock size={14} className="text-green-500" />
          </h1>
        </div>
      </div>

      <div className="p-6 pb-32">
        {/* Credit Card Visualization */}
        <div className="w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-[#2a2a35] to-[#121214] border border-white/10 p-6 relative overflow-hidden shadow-2xl mb-8 group transition-transform hover:scale-[1.02]">
          {/* Card Shine */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
               <div className="w-12 h-8 bg-gray-600/50 rounded flex items-center justify-center border border-white/10">
                 <div className="w-6 h-4 border border-white/30 rounded-sm"></div>
               </div>
               <span className="font-mono text-white/50 text-sm">DEBIT</span>
            </div>
            
            <div className="font-mono text-white text-xl tracking-widest my-4">
              •••• •••• •••• 4242
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Titular</p>
                <p className="text-sm text-white font-medium tracking-wide">{currentUser.fullName.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase text-right">Validade</p>
                <p className="text-sm text-white font-medium tracking-wide">12/28</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-surface rounded-xl border border-gray-800 p-5 mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Resumo do Pagamento</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Total da Locação</span>
              <span className="text-white font-medium">R$ {bookingData.totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
               <div className="flex items-center gap-1.5">
                 <span className="text-gray-300">Caução de Segurança</span>
                 <ShieldCheck size={12} className="text-blue-500" />
               </div>
               <span className="text-blue-400 font-medium">R$ {bookingData.depositAmount}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-end">
             <span className="text-sm text-gray-400">Cobrado Hoje</span>
             <span className="text-2xl font-bold text-primary">R$ {bookingData.totalPrice}</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-right">
            * A caução de R$ {bookingData.depositAmount} é apenas um bloqueio temporário.
          </p>
        </div>

        {/* Clickwrap Contract */}
        <div className="bg-surface/50 rounded-xl border border-gray-800 p-4 mb-8">
           <div className="flex gap-3">
              <div 
                onClick={() => setAgreedToContract(!agreedToContract)}
                className={`mt-1 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${agreedToContract ? 'bg-primary border-primary' : 'border-gray-600 bg-background'}`}
              >
                {agreedToContract && <Check size={14} className="text-white" />}
              </div>
              <div className="text-xs text-gray-300 leading-relaxed">
                Eu concordo com os <span className="text-white font-bold cursor-pointer hover:underline">Termos de Serviço</span> e o <span className="text-white font-bold cursor-pointer hover:underline">Contrato de Locação v1.0</span>. Autorizo o bloqueio da caução no meu cartão.
              </div>
           </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-800 z-50">
        <Button 
          fullWidth 
          onClick={handlePay} 
          disabled={!agreedToContract} 
          isLoading={loading}
          className="h-14 text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        >
          <div className="flex items-center gap-2">
            Pagar & Assinar
            <ChevronRight size={20} />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default PaymentScreen;
