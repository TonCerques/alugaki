
import React, { useState } from 'react';
import { ArrowLeft, BarChart2, TrendingUp, Star, Eye, DollarSign, Edit2, PauseCircle, PlayCircle } from 'lucide-react';
import { Profile, Item } from '../types';
import { itemTable, bookingTable } from '../lib/db';
import Button from '../components/Button';

interface LessorDashboardScreenProps {
  currentUser: Profile;
  onBack: () => void;
}

const LessorDashboardScreen: React.FC<LessorDashboardScreenProps> = ({ currentUser, onBack }) => {
  const [items, setItems] = useState<Item[]>(itemTable.findByOwner(currentUser.id));
  
  // Calculate KPIs
  const totalRevenue = bookingTable.calculateRevenue(currentUser.id);
  const totalViews = items.reduce((acc, item) => acc + (item.views || 0), 0);
  const totalBookings = items.reduce((acc, item) => acc + (item.bookingsCount || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : '0.0';
  
  // Mock monthly revenue comparison
  const lastMonthRevenue = totalRevenue * 0.8; 
  const growth = totalRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(0) : 0;

  const handleToggleStatus = (item: Item) => {
    const newItem = itemTable.update(item.id, { isActive: !item.isActive });
    if (newItem) {
      setItems(prev => prev.map(i => i.id === newItem.id ? newItem : i));
    }
  };

  const handleEditPrice = (item: Item) => {
    const newPriceStr = prompt("Novo valor da diária (R$):", item.dailyPrice.toString());
    if (newPriceStr && !isNaN(Number(newPriceStr))) {
      const newItem = itemTable.update(item.id, { dailyPrice: Number(newPriceStr) });
      if (newItem) {
        setItems(prev => prev.map(i => i.id === newItem.id ? newItem : i));
      }
    }
  };

  return (
    <div className="h-full bg-background flex flex-col z-50 animate-fade-in overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-800 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          Painel do Locador
          <BarChart2 size={16} className="text-primary" />
        </h1>
      </div>

      <div className="p-4 pb-24">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           {/* Revenue Card */}
           <div className="col-span-2 bg-gradient-to-br from-gray-800 to-surface border border-gray-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <DollarSign size={20} />
                 </div>
                 <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded text-xs text-green-400 font-bold">
                    <TrendingUp size={12} />
                    +{growth}%
                 </div>
              </div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Faturamento (Mês)</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">R$ {totalRevenue.toFixed(2)}</h2>
           </div>

           {/* Conversion Card */}
           <div className="bg-surface border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Conversão</p>
              <h3 className="text-xl font-bold text-white">{conversionRate}%</h3>
              <p className="text-xs text-gray-400 mt-1">{totalBookings} reservas</p>
           </div>

           {/* Reputation Card */}
           <div className="bg-surface border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Reputação</p>
              <div className="flex items-center gap-1">
                 <h3 className="text-xl font-bold text-white">5.0</h3>
                 <Star size={14} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">12 avaliações</p>
           </div>
        </div>

        {/* Funnel Section */}
        <div className="mb-8">
           <h3 className="text-white font-bold mb-4 flex items-center gap-2">
             Funil de Performance
           </h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-xs text-gray-400 mb-1">
                 <span>Visualizações</span>
                 <span>{totalViews}</span>
               </div>
               <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-secondary w-full opacity-50"></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-xs text-gray-400 mb-1">
                 <span>Cliques (Interesse)</span>
                 <span>{Math.round(totalViews * 0.15)}</span>
               </div>
               <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[15%]"></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-xs text-gray-400 mb-1">
                 <span>Reservas Confirmadas</span>
                 <span>{totalBookings}</span>
               </div>
               <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-[5%]"></div>
               </div>
             </div>
           </div>
        </div>

        {/* Catalog Management */}
        <div>
           <h3 className="text-white font-bold mb-4">Meus Anúncios</h3>
           <div className="space-y-3">
             {items.map(item => (
               <div key={item.id} className="bg-surface border border-gray-800 rounded-xl p-3 flex gap-3 items-center group">
                 <div className="w-16 h-16 bg-gray-900 rounded-lg overflow-hidden shrink-0 relative">
                   <img src={item.images[0]} className={`w-full h-full object-cover ${!item.isActive ? 'grayscale opacity-50' : ''}`} />
                   {!item.isActive && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                       <PauseCircle size={20} className="text-white" />
                     </div>
                   )}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <h4 className={`text-sm font-bold truncate ${item.isActive ? 'text-white' : 'text-gray-500'}`}>{item.title}</h4>
                   <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                     <span className="flex items-center gap-1"><Eye size={10} /> {item.views || 0}</span>
                     <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                     <span>R$ {item.dailyPrice}/dia</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      className={`p-2 rounded-lg transition-colors ${item.isActive ? 'bg-gray-800 text-gray-400 hover:text-yellow-500' : 'bg-green-500/10 text-green-500'}`}
                    >
                      {item.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                    </button>
                    <button 
                       onClick={() => handleEditPrice(item)}
                       className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                 </div>
               </div>
             ))}
             {items.length === 0 && (
               <div className="text-center py-8 text-gray-500 text-sm bg-surface/30 rounded-xl border border-dashed border-gray-800">
                 Você ainda não tem itens publicados.
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LessorDashboardScreen;
