
import React from 'react';
import { Home, PlusSquare, User, MessageSquare } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'browse' | 'inbox' | 'create' | 'profile';
  onTabChange: (tab: 'browse' | 'inbox' | 'create' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'browse', icon: Home, label: 'Explorar' },
    { id: 'inbox', icon: MessageSquare, label: 'Mensagens' },
    { id: 'create', icon: PlusSquare, label: 'Publicar' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-background to-transparent pb-6">
      <div className="bg-surface/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10 -translate-y-1' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_currentColor]"></span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
