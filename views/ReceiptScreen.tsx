
import React, { useState } from 'react';
import { Check, Calendar, MapPin, Download, MessageSquare, ShieldCheck, Printer } from 'lucide-react';
import Button from '../components/Button';
import { chatTable, bookingTable, itemTable, profileTable } from '../lib/db';
import { Profile } from '../types';

interface ReceiptScreenProps {
  chatRoomId: string;
  currentUser: Profile;
  onContinue: () => void;
}

const ReceiptScreen: React.FC<ReceiptScreenProps> = ({ chatRoomId, currentUser, onContinue }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch Data
  const room = chatTable.getRoomsByUser(currentUser.id).find(r => r.id === chatRoomId);
  const booking = room ? bookingTable.findById(room.bookingId) : null;
  const item = booking ? itemTable.findById(booking.itemId) : null;
  const owner = booking ? profileTable.find(booking.ownerId) : null;

  if (!booking || !item || !owner) return null;

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  
  // Mock Address (In a real app, this comes from the Item or Owner profile)
  const pickupAddress = "Rua da Tecnologia, 123 - Vila Olímpia, São Paulo - SP";

  const handlePrintPDF = () => {
    setIsGeneratingPdf(true);
    // Pequeno delay para feedback visual antes de abrir a janela de impressão
    setTimeout(() => {
      window.print();
      setIsGeneratingPdf(false);
    }, 800);
  };

  return (
    <div className="h-full bg-background flex flex-col items-center justify-center p-6 z-50 animate-fade-in overflow-y-auto custom-scrollbar print:bg-white print:p-0 print:overflow-visible">
      
      {/* Estilos específicos para impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background-color: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Forçar cores de fundo para Webkit (Chrome/Safari) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Esconder elementos escuros e botões */
          .no-print {
            display: none !important;
          }
          /* Ajustar textos para preto na impressão */
          .text-white {
            color: black !important;
          }
          .text-gray-300, .text-gray-400, .text-gray-500 {
            color: #4b5563 !important; /* Gray-600 */
          }
          .bg-surface {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
          }
          /* Esconder scrollbar */
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      {/* Success Header (Hidden on Print) */}
      <div className="text-center mb-8 pt-8 no-print">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slight">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            <Check size={28} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Pagamento Confirmado!</h1>
        <p className="text-gray-400 text-sm">Sua reserva foi garantida com sucesso.</p>
      </div>

      {/* Receipt Card - Área Imprimível */}
      <div className="print-area bg-surface w-full max-w-md rounded-2xl border border-gray-700 overflow-hidden relative shadow-2xl mb-8 print:shadow-none print:border-gray-200">
        {/* Decorative Top Border */}
        <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full print:bg-purple-600"></div>
        
        {/* Receipt Header */}
        <div className="p-6 border-b border-gray-800 border-dashed print:border-gray-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Comprovante #</p>
              <p className="text-xs text-white font-mono">{booking.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Data</p>
              <p className="text-xs text-white">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-background/50 p-3 rounded-xl border border-gray-800 print:bg-gray-50 print:border-gray-200">
            <img src={item.images[0]} className="w-16 h-16 rounded-lg object-cover bg-gray-900 print:border print:border-gray-300" alt="Item" />
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1">{item.title}</h3>
              <p className="text-xs text-gray-400">{owner.fullName}</p>
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-6">
          
          {/* Dates */}
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 print:border print:border-gray-200">
               <Calendar size={16} className="text-primary print:text-purple-600" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase mb-1">Período de Uso</p>
               <p className="text-sm text-white font-medium">
                 {startDate.toLocaleDateString('pt-BR')} até {endDate.toLocaleDateString('pt-BR')}
               </p>
               <p className="text-xs text-gray-400 mt-0.5">
                 {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} diárias
               </p>
             </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 print:border print:border-gray-200">
               <MapPin size={16} className="text-secondary print:text-cyan-600" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase mb-1">Retirada em</p>
               <p className="text-sm text-white font-medium leading-relaxed">
                 {pickupAddress}
               </p>
               <p className="text-[10px] text-gray-500 mt-1 italic no-print">
                 * Combine o horário exato no chat.
               </p>
             </div>
          </div>

          {/* Financials */}
          <div className="bg-background rounded-xl p-4 border border-gray-800 print:bg-gray-50 print:border-gray-200">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Aluguel + Taxas</span>
              <span>R$ {booking.totalPrice}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1">Caução (Bloqueado) <ShieldCheck size={10}/></span>
              <span>R$ {booking.depositAmount}</span>
            </div>
            <div className="h-px bg-gray-700 my-2 print:bg-gray-300"></div>
            <div className="flex justify-between text-sm text-white font-bold">
              <span>Total Pago</span>
              <span className="text-primary print:text-purple-600">R$ {booking.totalPrice}</span>
            </div>
          </div>
          
          <div className="hidden print:block text-center mt-8 pt-8 border-t border-gray-200">
             <p className="text-xs text-gray-500">Recibo gerado eletronicamente pelo app Alugaki.</p>
             <p className="text-xs text-gray-500">www.alugaki.com.br</p>
          </div>

        </div>

        {/* Ticket Cutout Effect (Visual Only - Hidden on Print) */}
        <div className="relative h-4 bg-background -mx-2 no-print">
           <div className="absolute -top-2 left-0 w-4 h-4 bg-background rounded-full"></div>
           <div className="absolute -top-2 right-0 w-4 h-4 bg-background rounded-full"></div>
           <div className="absolute top-0 left-4 right-4 border-t border-dashed border-gray-700"></div>
        </div>
      </div>

      {/* Actions (Hidden on Print) */}
      <div className="w-full max-w-md space-y-3 pb-8 no-print">
        <Button fullWidth onClick={onContinue} className="shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            Combinar Entrega
          </div>
        </Button>
        
        <Button 
          fullWidth 
          variant="ghost" 
          className="text-xs text-gray-500 hover:text-white"
          onClick={handlePrintPDF}
          isLoading={isGeneratingPdf}
        >
          <div className="flex items-center gap-2">
            {isGeneratingPdf ? <Printer size={14} className="animate-pulse"/> : <Download size={14} />}
            {isGeneratingPdf ? 'Preparando PDF...' : 'Baixar Comprovante (PDF)'}
          </div>
        </Button>
      </div>

    </div>
  );
};

export default ReceiptScreen;
