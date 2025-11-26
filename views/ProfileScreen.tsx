
import React from 'react';
import Button from '../components/Button';
import { Profile } from '../types';
import { Settings, CreditCard, Shield, LogOut } from 'lucide-react';

interface ProfileScreenProps {
  userProfile: Profile;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, onLogout }) => {
  const menuItems = [
    { icon: Settings, label: 'Configurações' },
    { icon: CreditCard, label: 'Pagamentos' },
    { icon: Shield, label: 'Privacidade & Segurança' },
  ];

  return (
    <div className="pb-24 pt-8 px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-[3px] mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <div className="w-full h-full rounded-full bg-[#1E1E24] flex items-center justify-center">
             <span className="text-3xl font-bold text-white">{userProfile.fullName.charAt(0)}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{userProfile.fullName}</h2>
        <p className="text-sm text-secondary">Membro Verificado</p>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 mb-6">
         <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Saldo</span>
            <span className="text-xl font-bold text-white">R$ 0,00</span>
         </div>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <button key={item.label} className="w-full bg-surface hover:bg-white/5 p-4 rounded-xl flex items-center gap-4 transition-colors text-left border border-transparent hover:border-white/5">
            <item.icon size={20} className="text-gray-400" />
            <span className="text-white font-medium flex-1">{item.label}</span>
          </button>
        ))}
        
        <button 
          onClick={onLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-xl flex items-center gap-4 transition-colors text-left border border-red-500/20 mt-8"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="text-red-500 font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
