
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowLeft, Send, AlertTriangle, Check, CheckCheck, Camera, PackageCheck } from 'lucide-react';
import { Profile, BookingStatus, KycStatus } from '../types';
import { chatTable, bookingTable, itemTable, profileTable } from '../lib/db';
import { socket } from '../lib/socket';
import Button from '../components/Button';

interface ChatScreenProps {
  chatRoomId: string;
  currentUser: Profile;
  onBack: () => void;
  onPayPress?: () => void; // New prop for navigation
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chatRoomId, currentUser, onBack, onPayPress }) => {
  const [inputText, setInputText] = useState('');
  
  // Lazy init for performance
  const [messages, setMessages] = useState<any[]>(() => chatTable.getMessages(chatRoomId));
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [_, setTick] = useState(0); // Force update trigger
  const [actionLoading, setActionLoading] = useState(false);

  // Sync Data Loading
  const room = chatTable.getRoomsByUser(currentUser.id).find(r => r.id === chatRoomId);
  const booking = room ? bookingTable.findById(room.bookingId) : null;
  const item = booking ? itemTable.findById(booking.itemId) : null;
  
  // Identify Other User with Fallback
  let otherUserId: string | undefined;
  if (room) {
    otherUserId = room.participants.find(id => id !== currentUser.id);
    if (!otherUserId && room.participants.includes(currentUser.id)) {
      otherUserId = currentUser.id; // Self-chat fallback
    }
  }
  
  // ROBUST FALLBACK: If owner is missing in DB (e.g. legacy data), use a placeholder
  const otherUser = (otherUserId ? profileTable.find(otherUserId) : null) || {
    id: 'unknown',
    fullName: 'Usuário Desconhecido',
    email: '',
    kycStatus: KycStatus.VERIFIED,
    createdAt: new Date().toISOString()
  } as Profile;

  const isOwner = booking && currentUser.id === booking.ownerId;

  // --- REALTIME LOGIC ---
  useEffect(() => {
    socket.emit('join_room', { roomId: chatRoomId });

    const handleNewMessage = (msg: any) => {
      if (msg.roomId === chatRoomId) {
        setMessages(prev => {
          // Deduplication check
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [chatRoomId]);

  // Instant Scroll to bottom
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = inputText.trim();
    if (!content) return;

    // Optimistic Update (Immediate Feedback)
    const tempId = 'temp-' + Date.now();
    const optimMsg = {
      id: tempId,
      roomId: chatRoomId,
      senderId: currentUser.id,
      content: content,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    setMessages(prev => [...prev, optimMsg]);
    setInputText('');

    // Actual Send
    socket.emit('send_message', {
      roomId: chatRoomId,
      senderId: currentUser.id,
      content: content
    });
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (!booking) return;
    bookingTable.updateStatus(booking.id, newStatus);
    
    // System Notification
    const action = newStatus === BookingStatus.AWAITING_PAYMENT ? 'Aprovada' : 'Rejeitada';
    socket.emit('send_message', {
      roomId: chatRoomId,
      senderId: 'system',
      content: `A solicitação foi ${action} pelo proprietário.`
    });

    setTick(t => t + 1); // Force re-render
  };

  const handleHandover = async () => {
    if (!booking) return;
    setActionLoading(true);
    // Simulate photo upload delay
    await new Promise(r => setTimeout(r, 1500));
    
    bookingTable.handover(booking.id);
    setActionLoading(false);
    setTick(t => t + 1);
  };

  const handleReturn = async () => {
    if (!booking) return;
    setActionLoading(true);
    // Simulate checks
    await new Promise(r => setTimeout(r, 1500));
    bookingTable.returnItem(booking.id);
    setActionLoading(false);
    setTick(t => t + 1);
  };

  // Only block if critical booking data is missing. 
  // We tolerate missing user profile now (handled by fallback)
  if (!room || !booking || !item) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-gray-500">Carregando conversa...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background fixed inset-0 z-50">
      {/* Header */}
      <div className="bg-surface/95 backdrop-blur-xl border-b border-gray-800 pt-safe-top flex items-center gap-3 p-4 shadow-sm z-20">
        <button onClick={onBack} className="text-gray-400 hover:text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={22} />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
           {otherUser.fullName.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white text-sm flex items-center gap-2 truncate">
            {otherUser.fullName}
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider ${isOwner ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
              {isOwner ? 'LOCATÁRIO' : 'DONO'}
            </span>
          </h2>
          <p className="text-xs text-gray-400 truncate">{item.title}</p>
        </div>
      </div>

      {/* --- LIFECYCLE ACTION BARS --- */}

      {/* 1. APPROVAL (Owner - Pending) */}
      {isOwner && booking.status === BookingStatus.PENDING_APPROVAL && (
        <div className="bg-[#1E1E24] p-4 border-b border-gray-800 shadow-xl relative z-10 animate-fade-in-up">
           <div className="flex items-start gap-3 mb-3">
             <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
             <p className="text-xs text-gray-300 leading-relaxed">
               <span className="font-bold text-white block mb-0.5">Solicitação de Reserva</span>
               Analise o perfil e decida se aprova a locação.
             </p>
           </div>
           <div className="flex gap-3">
             <Button 
                variant="secondary" 
                className="flex-1 h-9 text-xs bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40" 
                onClick={() => handleStatusChange(BookingStatus.REJECTED)}
             >
               Recusar
             </Button>
             <Button 
                className="flex-1 h-9 text-xs shadow-none" 
                onClick={() => handleStatusChange(BookingStatus.AWAITING_PAYMENT)}
             >
               Aprovar
             </Button>
           </div>
        </div>
      )}

      {/* 2. PAYMENT (Renter - Approved) */}
      {!isOwner && booking.status === BookingStatus.AWAITING_PAYMENT && (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 border-b border-green-500/20 flex items-center justify-between z-10 animate-fade-in">
           <div>
             <div className="flex items-center gap-2 text-sm text-white font-bold">
               <CheckCheck size={16} className="text-green-500" />
               Aprovado!
             </div>
             <div className="text-xs text-gray-400 mt-0.5">Faça o pagamento para reservar.</div>
           </div>
           <Button 
             className="h-8 text-xs px-4 bg-green-600 hover:bg-green-500 border-none text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
             onClick={onPayPress}
           >
             Pagar R$ {booking.totalPrice}
           </Button>
        </div>
      )}

      {/* 3. HANDOVER (Owner - Confirmed) */}
      {isOwner && booking.status === BookingStatus.CONFIRMED && (
        <div className="bg-[#1E1E24] p-4 border-b border-gray-800 z-10 animate-fade-in">
           <div className="flex items-start gap-3 mb-3">
             <Camera className="text-primary shrink-0 mt-0.5" size={16} />
             <p className="text-xs text-gray-300">
               <span className="font-bold text-white block mb-0.5">Pronto para Entrega</span>
               Encontre o locatário, verifique o documento e confirme a entrega.
             </p>
           </div>
           <Button 
             fullWidth 
             className="h-9 text-xs" 
             onClick={handleHandover}
             isLoading={actionLoading}
           >
             Confirmar Entrega
           </Button>
        </div>
      )}
      
      {/* 3b. HANDOVER WAITING (Renter - Confirmed) */}
      {!isOwner && booking.status === BookingStatus.CONFIRMED && (
         <div className="bg-surface p-3 border-b border-gray-800 flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
               <Camera size={16} className="text-primary" />
            </div>
            <p className="text-xs text-gray-400">Encontre o dono para retirar. Ele confirmará a entrega.</p>
         </div>
      )}

      {/* 4. RETURN (Owner - Active) */}
      {isOwner && booking.status === BookingStatus.ACTIVE && (
        <div className="bg-[#1E1E24] p-4 border-b border-gray-800 z-10 animate-fade-in">
           <div className="flex items-start gap-3 mb-3">
             <PackageCheck className="text-secondary shrink-0 mt-0.5" size={16} />
             <p className="text-xs text-gray-300">
               <span className="font-bold text-white block mb-0.5">Em Locação</span>
               Ao receber o item de volta, inspecione e confirme para liberar a caução.
             </p>
           </div>
           <Button 
             fullWidth 
             variant="secondary"
             className="h-9 text-xs" 
             onClick={handleReturn}
             isLoading={actionLoading}
           >
             Confirmar Devolução
           </Button>
        </div>
      )}

      {/* 5. COMPLETED */}
      {booking.status === BookingStatus.COMPLETED && (
        <div className="bg-green-500/10 p-4 border-b border-green-500/20 flex items-center justify-center gap-2 z-10">
           <CheckCheck size={16} className="text-green-500" />
           <span className="text-xs text-white font-bold">Locação Finalizada com Sucesso</span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background scroll-smooth" ref={scrollRef}>
        <div className="flex justify-center my-6">
           <span className="text-[10px] text-gray-600 uppercase tracking-widest bg-surface/50 px-3 py-1 rounded-full">
             {new Date(booking.createdAt).toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}
           </span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.senderId === 'system';
          // Only animate recent messages to improve initial load performance
          const shouldAnimate = index > messages.length - 3; 

          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="text-[10px] text-gray-400 bg-surface/80 border border-gray-800 px-3 py-1 rounded-full text-center max-w-[80%] whitespace-pre-wrap">
                   {msg.content}
                 </span>
               </div>
             )
          }

          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group
                  ${isMe 
                    ? 'bg-primary text-white rounded-br-none shadow-[0_2px_10px_rgba(139,92,246,0.15)]' 
                    : 'bg-surface border border-gray-800 text-gray-200 rounded-bl-none'}
                  ${msg.isOptimistic ? 'opacity-70' : 'opacity-100'}
                `}
              >
                {msg.content}
                {isMe && msg.isOptimistic && (
                  <span className="absolute bottom-1 right-2 text-[8px] opacity-70">...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      {booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.REJECTED && (
        <div className="p-3 bg-surface/95 backdrop-blur border-t border-gray-800 safe-bottom">
          <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-background rounded-full px-5 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary border border-gray-800 transition-all text-sm"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-800 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 shrink-0"
            >
              <Send size={18} className={inputText.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
