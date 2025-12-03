
import React, { useState } from 'react';
import { Profile, BookingStatus, KycStatus } from '../types';
import { bookingTable, chatTable, itemTable, profileTable } from '../lib/db';
import { MessageSquare, Clock, ArrowUpRight, ArrowDownLeft, PlusCircle, Search } from 'lucide-react';
import Button from '../components/Button';

interface InboxScreenProps {
  currentUser: Profile;
  onChatSelect: (chatRoomId: string) => void;
  onNavigateToCreate: () => void;
  onNavigateToBrowse: () => void;
}

type InboxTab = 'orders' | 'requests'; // Pedidos (Eu alugando) vs Solicitações (Me alugando)

const InboxScreen: React.FC<InboxScreenProps> = ({ currentUser, onChatSelect, onNavigateToCreate, onNavigateToBrowse }) => {
  const [activeTab, setActiveTab] = useState<InboxTab>('orders');
  
  // Get all rooms involving user
  const allRooms = chatTable.getRoomsByUser(currentUser.id);

  // Filter based on role
  const filteredRooms = allRooms.filter(room => {
    const booking = bookingTable.findById(room.bookingId);
    if (!booking) return false;
    
    if (activeTab === 'requests') {
      // Solicitações: Sou o DONO (Owner)
      return booking.ownerId === currentUser.id;
    } else {
      // Pedidos: Sou o LOCATÁRIO (Renter)
      return booking.renterId === currentUser.id;
    }
  });

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6 animate-fade-in-up">
      <div className="w-20 h-20 bg-surface border border-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
        {activeTab === 'requests' ? (
          <PlusCircle size={32} className="text-primary" />
        ) : (
          <Search size={32} className="text-secondary" />
        )}
      </div>
      
      {activeTab === 'requests' ? (
        <>
          <h3 className="text-white text-lg font-bold mb-2">
            Seu equipamento parado é dinheiro perdido.
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mb-8 leading-relaxed">
            Publique seu primeiro item agora e comece a faturar com aluguéis seguros.
          </p>
          <Button onClick={onNavigateToCreate} className="min-w-[160px]">
            Anunciar Agora
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-white text-lg font-bold mb-2">
            Nenhum pedido realizado
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mb-8 leading-relaxed">
            Explore nossa comunidade e encontre o equipamento perfeito para seu próximo projeto.
          </p>
          <Button variant="secondary" onClick={onNavigateToBrowse} className="min-w-[160px]">
            Explorar Equipamentos
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="pb-24 pt-4 px-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-6">Mensagens</h1>

      {/* Tabs */}
      <div className="flex bg-surface p-1 rounded-xl mb-6 border border-gray-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'orders' 
              ? 'bg-gray-700 text-white shadow-md' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'requests' 
              ? 'bg-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Solicitações
        </button>
      </div>
      
      {/* List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? renderEmptyState() : filteredRooms.map(room => {
          const booking = bookingTable.findById(room.bookingId);
          if (!booking) return null;

          const item = itemTable.findById(booking.itemId);
          
          // Determine "Other User" safely
          let otherUserId = room.participants.find(id => id !== currentUser.id);
          // Handle self-rental edge case
          if (!otherUserId) otherUserId = currentUser.id;

          const otherUser = (otherUserId ? profileTable.find(otherUserId) : null) || {
            id: 'unknown',
            fullName: 'Usuário Desconhecido',
            email: '',
            kycStatus: KycStatus.VERIFIED,
            createdAt: new Date().toISOString()
          } as Profile;
          
          // Even if item is deleted, we might want to show history, but for MVP let's require item
          if (!item) return null;

          const statusColors: Record<string, string> = {
            [BookingStatus.PENDING_APPROVAL]: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
            [BookingStatus.AWAITING_PAYMENT]: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            [BookingStatus.CONFIRMED]: 'text-green-500 bg-green-500/10 border-green-500/20',
            [BookingStatus.REJECTED]: 'text-red-500 bg-red-500/10 border-red-500/20',
            [BookingStatus.ACTIVE]: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
          };

          const statusStyle = statusColors[booking.status] || 'text-gray-500 bg-gray-500/10';

          return (
            <div 
              key={room.id} 
              onClick={() => onChatSelect(room.id)}
              className="bg-surface p-4 rounded-xl border border-gray-800 active:scale-[0.98] transition-all cursor-pointer hover:border-gray-600 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-50">
                 {activeTab === 'requests' ? <ArrowDownLeft size={16} className="text-primary"/> : <ArrowUpRight size={16} className="text-secondary"/>}
              </div>

              <div className="flex justify-between items-start mb-3 pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white shadow-inner">
                    {otherUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{otherUser.fullName}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                 <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${statusStyle}`}>
                  {booking.status.replace('_', ' ')}
                </div>
                <span className="text-[10px] text-gray-600">
                  {new Date(room.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {activeTab === 'requests' && booking.status === BookingStatus.PENDING_APPROVAL && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-500 font-medium animate-pulse">
                  <Clock size={12} />
                  <span>Ação Necessária</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InboxScreen;
