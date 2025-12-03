
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Coachmark from '../components/Coachmark';
import { Profile, KycStatus } from '../types';
import { 
  Settings, CreditCard, Shield, LogOut, Lightbulb, ChevronRight, 
  Bell, Moon, Fingerprint, CheckCircle, Smartphone, Trash2, 
  Plus, ArrowLeft, Wallet, FileText, AlertTriangle, BarChart2
} from 'lucide-react';

interface ProfileScreenProps {
  userProfile: Profile;
  onLogout: () => void;
  onOpenDashboard?: () => void;
}

type SubView = 'MAIN' | 'SETTINGS' | 'PAYMENTS' | 'SECURITY';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, onLogout, onOpenDashboard }) => {
  const [currentView, setCurrentView] = useState<SubView>('MAIN');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showKycCoachmark, setShowKycCoachmark] = useState(false);

  // Settings State Mock
  const [settings, setSettings] = useState({
    push: true,
    biometric: false
  });

  useEffect(() => {
    if (currentView === 'MAIN' && userProfile.kycStatus !== KycStatus.VERIFIED) {
      const hasSeen = localStorage.getItem('alugaki_coachmark_kyc');
      if (!hasSeen) {
        setTimeout(() => setShowKycCoachmark(true), 500);
      }
    }
  }, [currentView, userProfile.kycStatus]);

  const closeCoachmark = () => {
    setShowKycCoachmark(false);
    localStorage.setItem('alugaki_coachmark_kyc', 'true');
  };

  const MenuItem = ({ icon: Icon, label, onClick, destuctive = false, highlight = false }: any) => (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border group active:scale-[0.98] ${
        destuctive 
          ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/30' 
          : highlight
             ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-primary/20 hover:border-primary/50'
             : 'bg-[#1E1E24] hover:bg-[#2A2A35] border-transparent hover:border-gray-700'
      }`}
    >
      <div className={`p-2 rounded-lg ${
         destuctive ? 'bg-red-500/10 text-red-500' : 
         highlight ? 'bg-primary/20 text-primary' :
         'bg-gray-800/50 text-gray-400 group-hover:text-white group-hover:bg-primary/20 transition-colors'
      }`}>
        <Icon size={20} />
      </div>
      <span className={`font-medium flex-1 text-left ${destuctive ? 'text-red-500' : 'text-white'}`}>
        {label}
      </span>
      {!destuctive && <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />}
    </button>
  );

  const SubViewHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <button 
        onClick={() => setCurrentView('MAIN')}
        className="w-10 h-10 rounded-full bg-surface border border-gray-700 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  );

  // --- SUB-VIEWS ---

  const renderSettings = () => (
    <div className="animate-fade-in-up">
      <SubViewHeader title="Configurações" />
      
      <div className="space-y-4">
        <div className="bg-[#1E1E24] p-4 rounded-xl flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-gray-400" />
            <span className="text-white font-medium">Notificações Push</span>
          </div>
          <button 
            onClick={() => setSettings(s => ({...s, push: !s.push}))}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.push ? 'bg-primary' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.push ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="bg-[#1E1E24] p-4 rounded-xl flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <Fingerprint size={20} className="text-gray-400" />
            <span className="text-white font-medium">Login Biométrico</span>
          </div>
          <button 
            onClick={() => setSettings(s => ({...s, biometric: !s.biometric}))}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.biometric ? 'bg-primary' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.biometric ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="bg-[#1E1E24] p-4 rounded-xl flex items-center justify-between border border-white/5 opacity-70">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-gray-400" />
            <span className="text-white font-medium">Tema Escuro</span>
          </div>
          <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded">Sempre Ativo</span>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="animate-fade-in-up">
      <SubViewHeader title="Métodos de Pagamento" />
      
      <div className="bg-gradient-to-br from-[#2a2a35] to-[#121214] border border-primary/30 p-6 rounded-2xl mb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
         <div className="relative z-10 flex justify-between items-start mb-8">
           <div className="w-10 h-6 bg-white/10 rounded"></div>
           <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">PRINCIPAL</span>
         </div>
         <div className="text-white text-lg tracking-widest font-mono mb-4">•••• •••• •••• 8899</div>
         <div className="flex justify-between text-xs text-gray-400">
           <span>{userProfile.fullName.toUpperCase()}</span>
           <span>12/28</span>
         </div>
      </div>

      <Button variant="outline" fullWidth className="border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400">
        <Plus size={18} className="mr-2" />
        Adicionar Novo Cartão
      </Button>
    </div>
  );

  const renderSecurity = () => (
    <div className="animate-fade-in-up">
      <SubViewHeader title="Privacidade & Segurança" />
      
      <div className="bg-[#1E1E24] rounded-xl p-4 border border-white/5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            userProfile.kycStatus === KycStatus.VERIFIED ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
          }`}>
             <Shield size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Verificação de Identidade</h3>
            <p className="text-xs text-gray-400">
              {userProfile.kycStatus === KycStatus.VERIFIED ? 'Sua conta está segura e verificada.' : 'Verificação pendente.'}
            </p>
          </div>
        </div>
        {userProfile.kycStatus !== KycStatus.VERIFIED && (
          <Button fullWidth className="h-8 text-xs">Completar Verificação</Button>
        )}
      </div>

      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 pl-1">Sessões Ativas</h3>
      <div className="bg-[#1E1E24] rounded-xl p-4 border border-white/5 mb-8 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <Smartphone size={20} className="text-gray-400" />
           <div>
             <p className="text-white text-sm font-medium">iPhone 13 Pro</p>
             <p className="text-xs text-green-500">Dispositivo Atual • São Paulo, BR</p>
           </div>
         </div>
      </div>

      <h3 className="text-red-500/70 text-xs font-bold uppercase tracking-wider mb-3 pl-1">Danger Zone</h3>
      <button className="w-full border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-500 hover:bg-red-500/5 transition-colors">
        <Trash2 size={18} />
        <span className="text-sm font-medium">Excluir minha conta</span>
      </button>
    </div>
  );

  // --- MAIN VIEW ---
  
  if (currentView !== 'MAIN') {
    return <div className="p-6 pt-8 pb-24 h-full bg-background overflow-y-auto custom-scrollbar">
      {currentView === 'SETTINGS' && renderSettings()}
      {currentView === 'PAYMENTS' && renderPayments()}
      {currentView === 'SECURITY' && renderSecurity()}
    </div>;
  }

  return (
    <div className="pb-24 pt-8 px-6 relative h-full bg-background overflow-y-auto custom-scrollbar">
      
      {/* 2.1 HEADER DO PERFIL */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="relative mb-4 group">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary p-[3px] shadow-[0_0_25px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-500">
            <div className="w-full h-full rounded-full bg-[#1E1E24] flex items-center justify-center overflow-hidden">
               {userProfile.avatarUrl ? (
                 <img src={userProfile.avatarUrl} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl font-bold text-white">{userProfile.fullName.charAt(0)}</span>
               )}
            </div>
          </div>
          {userProfile.kycStatus === KycStatus.VERIFIED && (
            <div className="absolute bottom-1 right-1 bg-background rounded-full p-1">
              <CheckCircle size={24} className="text-secondary fill-secondary/20" />
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{userProfile.fullName}</h2>
        
        {userProfile.kycStatus === KycStatus.VERIFIED ? (
          <div className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full backdrop-blur-md">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest glow-text-cyan">
              Membro Verificado
            </span>
          </div>
        ) : (
          <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full backdrop-blur-md">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
              Verificação Pendente
            </span>
          </div>
        )}
      </div>

      {/* 2.2 CARD DE SALDO */}
      <div className="bg-[#2A2A35] rounded-2xl p-6 mb-8 border border-white/5 shadow-xl relative overflow-hidden group animate-fade-in-up">
         {/* Decorative elements */}
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
         
         <div className="relative z-10">
           <div className="flex justify-between items-start mb-6">
             <div>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Disponível</p>
               <h3 className="text-3xl font-extrabold text-white">R$ 0,00</h3>
             </div>
             <div className="bg-white/5 p-2 rounded-lg">
               <Wallet size={20} className="text-gray-400" />
             </div>
           </div>

           {/* Empty State / Tip */}
           <div className="mb-6 flex gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
              <Lightbulb size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Realize sua primeira locação para ver seu saldo crescer aqui.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-3">
             <Button className="h-10 text-xs font-bold shadow-none">
               Sacar
             </Button>
             <Button variant="secondary" className="h-10 text-xs font-bold bg-[#1E1E24] border-gray-600">
               Extrato
             </Button>
           </div>
         </div>
      </div>

      {/* 2.3 MENU DE NAVEGAÇÃO */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        
        {/* NEW DASHBOARD ITEM */}
        <MenuItem 
          icon={BarChart2} 
          label="Painel do Locador" 
          onClick={onOpenDashboard}
          highlight
        />

        <MenuItem 
          icon={Settings} 
          label="Configurações Gerais" 
          onClick={() => setCurrentView('SETTINGS')} 
        />
        <MenuItem 
          icon={CreditCard} 
          label="Pagamentos" 
          onClick={() => setCurrentView('PAYMENTS')} 
        />
        <MenuItem 
          icon={Shield} 
          label="Privacidade & Segurança" 
          onClick={() => setCurrentView('SECURITY')} 
        />
      </div>

      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
         <MenuItem 
            icon={LogOut} 
            label="Sair da Conta" 
            destuctive 
            onClick={() => setShowLogoutModal(true)} 
         />
         <p className="text-center text-xs text-gray-600 mt-6">Alugaki v1.0.0 (Beta)</p>
      </div>

      {/* 2.4 MODAL DE LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-[#1E1E24] border border-gray-700 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-bounce-slight">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <LogOut size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Encerrar Sessão?</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              Você precisará fazer login novamente para acessar seus equipamentos e mensagens.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </Button>
              <Button onClick={onLogout} className="bg-red-600 hover:bg-red-500 border-none shadow-none text-white">
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* COACHMARK (RF-023 / Requirement) */}
      {showKycCoachmark && (
        <Coachmark 
          text="Verifique sua conta para desbloquear aluguéis e aumentar sua credibilidade na plataforma."
          onClose={closeCoachmark}
          position="top"
        />
      )}
    </div>
  );
};

export default ProfileScreen;
