
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Heart, ShieldCheck, MapPin, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Lock, CreditCard, AlertCircle, Edit3 } from 'lucide-react';
import Button from '../components/Button';
import Coachmark from '../components/Coachmark';
import { itemTable, profileTable } from '../lib/db';
import { Profile } from '../types';

interface ItemDetailScreenProps {
  itemId: string;
  onBack: () => void;
  currentUser: Profile;
  onRequestPress: (startDate: string, endDate: string) => void;
  onEditItem?: (itemId: string) => void;
}

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ itemId, onBack, currentUser, onRequestPress, onEditItem }) => {
  const item = itemTable.findById(itemId);
  
  // State for Calendar Navigation
  const [displayedDate, setDisplayedDate] = useState(new Date());
  
  // State for Selection
  const [startDate, setStartDate] = useState<string | null>(null); // ISO Date String
  const [endDate, setEndDate] = useState<string | null>(null);   // ISO Date String

  // Educational States
  const [showButtonCoachmark, setShowButtonCoachmark] = useState(false);
  const [showDepositSheet, setShowDepositSheet] = useState(false);

  // Check if owner
  const isOwner = item ? currentUser.id === item.ownerId : false;

  useEffect(() => {
    // Coachmark logic: Show only once
    const hasSeenCoachmark = localStorage.getItem('alugaki_coachmark_request');
    if (!hasSeenCoachmark && !isOwner) {
      setTimeout(() => setShowButtonCoachmark(true), 800);
    }
  }, [isOwner]);

  if (!item) return <div className="p-8 text-center text-white">Item não encontrado</div>;

  const owner = profileTable.find(item.ownerId);

  // Derived Date Info
  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();
  const monthName = displayedDate.toLocaleString('pt-BR', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const startingDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  // Helpers
  const isDateDisabled = (day: number) => {
    const checkDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0,0,0,0);
    return checkDate < today;
  };

  const isDateSelected = (day: number) => {
    const checkDate = new Date(year, month, day).toISOString();
    return startDate?.startsWith(checkDate.split('T')[0]) || endDate?.startsWith(checkDate.split('T')[0]);
  };

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const checkDate = new Date(year, month, day);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate > start && checkDate < end;
  };

  const handleDayPress = (day: number) => {
    if (isDateDisabled(day)) return;

    const clickedDate = new Date(year, month, day);
    // Force set to noon to avoid timezone flips
    clickedDate.setHours(12, 0, 0, 0); 
    const clickedIso = clickedDate.toISOString();

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(clickedIso);
      setEndDate(null);
    } else {
      // Complete selection
      const start = new Date(startDate);
      if (clickedDate < start) {
        setStartDate(clickedIso);
        setEndDate(startDate);
      } else if (clickedDate.getTime() === start.getTime()) {
        // Deselect if clicking same day
        setStartDate(null);
        setEndDate(null);
      } else {
        setEndDate(clickedIso);
      }
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, month + offset, 1);
    setDisplayedDate(newDate);
  };

  const calculateTotal = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
      return { days: diffDays, total: diffDays * item.dailyPrice };
    }
    return { days: 0, total: 0 };
  };

  const { days: rentalDays, total: rentalTotal } = calculateTotal();
  const isValidSelection = !!startDate && !!endDate;

  const handleRequestClick = () => {
    if (isOwner) {
      // Edit Flow
      if (onEditItem) onEditItem(item.id);
      return;
    }

    if (!isValidSelection) return;

    // Smart Trigger: Check if user knows about deposit
    const hasSeenDepositInfo = localStorage.getItem('alugaki_deposit_info_seen');
    if (!hasSeenDepositInfo) {
      setShowDepositSheet(true);
    } else {
      handleNextStep();
    }
  };

  const handleDepositSheetDismiss = () => {
    localStorage.setItem('alugaki_deposit_info_seen', 'true');
    setShowDepositSheet(false);
    handleNextStep();
  };

  const handleNextStep = () => {
    if (startDate && endDate) {
      onRequestPress(startDate, endDate);
    }
  };

  const closeCoachmark = () => {
    setShowButtonCoachmark(false);
    localStorage.setItem('alugaki_coachmark_request', 'true');
  };

  return (
    <div className="bg-background h-full w-full overflow-y-auto custom-scrollbar relative animate-fade-in">
      {/* Top Nav Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20 pointer-events-none">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 pointer-events-auto transition-colors border border-white/10">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
            <Share2 size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[4/3] w-full">
        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-background"></div>
      </div>

      <div className="px-5 -mt-6 relative z-10 pb-32">
        {/* Title & Price */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-bold text-white leading-tight mb-2">{item.title}</h1>
            <div className="flex items-center gap-1.5 text-secondary text-sm bg-secondary/10 px-2 py-1 rounded-md w-fit border border-secondary/20">
               <MapPin size={14} />
               <span>São Paulo, SP (2km)</span>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-surface rounded-xl p-4 border border-gray-800 flex items-center gap-4 mb-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-bold text-white text-lg">
              {owner?.fullName.charAt(0) || 'U'}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{owner?.fullName || 'Desconhecido'}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <ShieldCheck size={12} className="text-green-500" />
              <span>Identidade Verificada</span>
              <span className="mx-1">•</span>
              <span>5.0 ★ (12 Reviews)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Sobre o equipamento</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-surface/50 p-4 rounded-xl border border-white/5 shadow-inner">
            {item.description}
          </p>
        </div>

        {/* Calendar Section */}
        <div className="mb-8 p-5 bg-surface rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Disponibilidade</h3>
            
            <div className="flex items-center gap-2 bg-background rounded-lg p-1 border border-gray-800">
               <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                 <ChevronLeft size={16} />
               </button>
               <span className="text-xs font-bold text-white w-24 text-center capitalize">
                 {monthName} {year}
               </span>
               <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
             {['D','S','T','Q','Q','S','S'].map(d => (
               <span key={d} className="text-[10px] font-bold text-gray-500">{d}</span>
             ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2 select-none">
            {/* Empty placeholders for start of month */}
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map(day => {
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const inRange = isDateInRange(day);
              
              let containerClass = "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all border relative";
              
              if (disabled) {
                containerClass += " bg-gray-800/30 border-transparent text-gray-700 cursor-not-allowed";
              } else if (selected) {
                containerClass += " bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] z-10 scale-105";
              } else if (inRange) {
                containerClass += " bg-primary/20 border-primary/20 text-white";
              } else {
                containerClass += " bg-surface border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800 cursor-pointer active:scale-95";
              }

              return (
                <div 
                  key={day}
                  onClick={() => !disabled && handleDayPress(day)}
                  className={containerClass}
                >
                  {day}
                </div>
              );
            })}
          </div>
          
          {/* Date Selection Feedback */}
          <div className="mt-4 flex gap-4 text-xs">
             <div className="flex-1 bg-background p-2 rounded border border-gray-800">
               <span className="text-gray-500 block text-[10px]">Início</span>
               <span className="text-white font-medium">
                 {startDate ? new Date(startDate).toLocaleDateString('pt-BR', {month:'short', day:'numeric'}) : '-'}
               </span>
             </div>
             <div className="flex-1 bg-background p-2 rounded border border-gray-800">
               <span className="text-gray-500 block text-[10px]">Fim</span>
               <span className="text-white font-medium">
                 {endDate ? new Date(endDate).toLocaleDateString('pt-BR', {month:'short', day:'numeric'}) : '-'}
               </span>
             </div>
          </div>
        </div>
        
        {/* Specs */}
         <div className="grid grid-cols-2 gap-4 mb-4">
           <div className="bg-surface p-4 rounded-xl border border-gray-800">
             <p className="text-xs text-gray-500 mb-1">Valor Reposição</p>
             <p className="text-white font-mono font-medium">R$ {item.replacementValue}</p>
           </div>
           <div className="bg-surface p-4 rounded-xl border border-gray-800">
             <p className="text-xs text-gray-500 mb-1">Caução</p>
             <p className="text-white font-mono font-medium">R$ {Math.round(item.replacementValue * 0.2)}</p>
           </div>
        </div>
        
      </div>

      {/* COACHMARK OVERLAY */}
      {showButtonCoachmark && (
        <Coachmark 
          text="O valor só é cobrado após o dono aceitar sua reserva. Pode solicitar sem medo!" 
          onClose={closeCoachmark}
          position="bottom"
        />
      )}

      {/* SMART TRIGGER: DEPOSIT INFO SHEET */}
      {showDepositSheet && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDepositSheet(false)}></div>
          <div className="bg-surface w-full max-w-md rounded-t-3xl p-6 border-t border-primary/20 relative z-10 animate-fade-in-up shadow-2xl">
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CreditCard size={20} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Sobre o Pagamento</h3>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Para alugar, você precisará de um cartão de crédito para a <strong>Caução de Segurança</strong>. 
              <br/><br/>
              <span className="text-white font-medium flex items-center gap-2">
                <Lock size={14} className="text-green-500" />
                Não cobraremos nada agora.
              </span>
              <span className="block text-gray-400 mt-1">O pagamento só acontece após a aprovação do proprietário.</span>
            </p>

            <Button fullWidth onClick={handleDepositSheetDismiss}>
              Entendi, continuar
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar with Realtime Calc */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121214]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-8 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {isValidSelection && !isOwner ? (
              <div className="animate-fade-in-up">
                <p className="text-xs text-gray-400 mb-0.5">{rentalDays} dias x R$ {item.dailyPrice}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">R$ {rentalTotal}</span>
                  <span className="text-xs text-gray-500">+ taxas</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Valor Diária</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold text-white">R$ {item.dailyPrice}</p>
                  <span className="text-sm text-gray-500 font-normal">/dia</span>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleRequestClick} 
            disabled={!isOwner && !isValidSelection}
            variant={isOwner ? "secondary" : "primary"}
            className={`px-6 transition-all min-w-[140px] ${(isOwner || isValidSelection) ? 'shadow-[0_0_20px_rgba(139,92,246,0.4)] opacity-100' : 'opacity-50 grayscale'}`}
          >
            <span className="flex items-center justify-center gap-2">
              {isOwner ? (
                <>
                  <Edit3 size={18} />
                  Editar
                </>
              ) : (
                <>
                  Solicitar
                  <ChevronRight size={18} />
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailScreen;
