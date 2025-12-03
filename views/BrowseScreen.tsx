
import React, { useState, useMemo } from 'react';
import { Search, MapPin, Filter, User, Sparkles } from 'lucide-react';
import { Item, ItemCategory, Profile } from '../types';
import { itemTable } from '../lib/db';

interface BrowseScreenProps {
  onItemPress: (itemId: string) => void;
  currentUser: Profile;
}

const BrowseScreen: React.FC<BrowseScreenProps> = ({ onItemPress, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  // Fetch items (in real app, this would be async/useEffect)
  const allItems = itemTable.findAll();

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const isMine = item.ownerId === currentUser.id;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (selectedCategory === 'Meus Anúncios') {
        matchesCategory = isMine;
      } else if (selectedCategory !== 'Todos') {
        matchesCategory = item.category === selectedCategory;
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [allItems, searchQuery, selectedCategory, currentUser.id]);

  const categories = ['Todos', 'Meus Anúncios', ...Object.values(ItemCategory)];

  return (
    <div className="pb-24 pt-4 px-4">
      {/* Header & Search */}
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-primary">Alugaki</span>, <span className="text-secondary">suas oportunidades!</span>
        </h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar câmeras, drones, luzes..." 
            className="w-full bg-surface border border-gray-800 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-white bg-gray-800/50 rounded-lg">
            <Filter size={16} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => {
            const isMyItemsCat = cat === 'Meus Anúncios';
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2
                  ${selectedCategory === cat 
                    ? isMyItemsCat 
                        ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                    : 'bg-surface border-gray-800 text-gray-400 hover:border-gray-600'}
                `}
              >
                {isMyItemsCat && <User size={14} />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isMine = item.ownerId === currentUser.id;
          
          return (
            <div 
              key={item.id}
              onClick={() => onItemPress(item.id)}
              className={`
                group bg-surface rounded-2xl overflow-hidden transition-all cursor-pointer active:scale-95 flex flex-col shadow-lg
                ${isMine ? 'border-2 border-secondary/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border border-gray-800 hover:border-gray-600'}
              `}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden bg-black/50">
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Visual Identity for Owner */}
                {isMine && (
                  <div className="absolute top-2 left-2 bg-secondary text-black px-2 py-1 rounded-md shadow-lg z-10 flex items-center gap-1">
                    <Sparkles size={10} fill="currentColor" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Seu Anúncio</span>
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-lg z-10">
                  <span className={`text-sm font-bold ${isMine ? 'text-secondary' : 'text-primary'}`}>
                    R$ {item.dailyPrice}
                  </span>
                  <span className="text-[10px] text-gray-300 ml-0.5">/dia</span>
                </div>
                
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                  <MapPin size={10} className={isMine ? 'text-secondary' : 'text-gray-400'} />
                  <span className="text-[10px] text-gray-300">2.5km</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-white truncate pr-2 flex-1">{item.title}</h3>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{item.description}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-800/50 mt-auto">
                   <span className="text-[10px] px-2 py-1 rounded bg-gray-800 text-gray-300 uppercase tracking-wide">
                     {item.category}
                   </span>
                   <div className="flex items-center gap-1.5">
                      <span className={`text-lg font-bold ${isMine ? 'text-secondary' : 'text-primary'}`}>
                        R$ {item.dailyPrice}
                      </span>
                      <span className="text-xs text-gray-500">/dia</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            {selectedCategory === 'Meus Anúncios' ? (
              <p>Você ainda não publicou nenhum anúncio.</p>
            ) : (
              <p>Nenhum item encontrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseScreen;
