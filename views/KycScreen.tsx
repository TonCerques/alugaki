
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { Profile, KycStatus } from '../types';
import { verificationTable, profileTable } from '../lib/db';

interface KycScreenProps {
  userProfile: Profile;
  onVerificationComplete: () => void;
}

const KycScreen: React.FC<KycScreenProps> = ({ userProfile, onVerificationComplete }) => {
  const [status, setStatus] = useState<KycStatus>(userProfile.kycStatus);
  const [isUploading, setIsUploading] = useState(false);
  
  // Update local status if prop changes
  useEffect(() => {
    setStatus(userProfile.kycStatus);
  }, [userProfile.kycStatus]);

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate network upload
    await new Promise(r => setTimeout(r, 1500));
    
    // Update DB
    verificationTable.create(userProfile.id, 'ID_CARD');
    setStatus(KycStatus.PENDING);
    setIsUploading(false);
  };

  const handleDevAutoVerify = async () => {
    // Hidden feature for development: Auto verify to test Phase 3
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 1000));
    profileTable.updateKycStatus(userProfile.id, KycStatus.VERIFIED);
    setStatus(KycStatus.VERIFIED);
    setIsUploading(false);
    setTimeout(onVerificationComplete, 1000);
  };

  const renderContent = () => {
    switch (status) {
      case KycStatus.VERIFIED:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Você está Verificado!</h2>
            <p className="text-gray-400 mb-8">Agora você pode alugar equipamentos com segurança.</p>
            <Button onClick={onVerificationComplete} fullWidth>
              Entrar no Marketplace
            </Button>
          </div>
        );

      case KycStatus.PENDING:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Em Análise</h2>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">
              Nossa equipe está analisando seus documentos. Isso geralmente leva 24 horas.
            </p>
            
            <div className="bg-surface p-4 rounded-xl border border-gray-800 text-left mb-6">
               <div className="flex items-start gap-3">
                 <Shield size={20} className="text-primary mt-1" />
                 <div>
                   <h3 className="text-sm font-semibold text-white">Proteção de Identidade</h3>
                   <p className="text-xs text-gray-500 mt-1">Seus dados são criptografados e usados apenas para verificação.</p>
                 </div>
               </div>
            </div>

            {/* DEV TOOL FOR MVP */}
            <div className="pt-8 border-t border-gray-800 mt-8">
              <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider">Opções de Desenvolvedor</p>
              <Button variant="ghost" className="text-xs w-full" onClick={handleDevAutoVerify} isLoading={isUploading}>
                [DEV] Simular Aprovação Admin
              </Button>
            </div>
          </div>
        );

      case KycStatus.REJECTED:
        return (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verificação Falhou</h2>
              <p className="text-gray-400 mb-8">Por favor, envie fotos mais nítidas do seu documento.</p>
              <Button onClick={() => setStatus(KycStatus.UNVERIFIED)} fullWidth variant="outline">
                Tentar Novamente
              </Button>
            </div>
          );

      case KycStatus.UNVERIFIED:
      default:
        return (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Verificar Identidade</h2>
              <p className="text-gray-400">
                Para garantir a confiança na comunidade P2P, precisamos validar seu documento oficial (RG/CNH).
              </p>
            </div>

            <div className="bg-surface border-2 border-dashed border-gray-700 rounded-2xl p-8 mb-8 text-center hover:border-primary/50 transition-colors cursor-pointer group" onClick={handleUpload}>
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-primary" />
              </div>
              <h3 className="text-white font-medium">Enviar Documento</h3>
              <p className="text-sm text-gray-500 mt-2">Toque para selecionar Frente e Verso</p>
            </div>

            <Button 
              fullWidth 
              onClick={handleUpload} 
              isLoading={isUploading}
            >
              Enviar para Análise
            </Button>
            
            <p className="text-xs text-center text-gray-600 mt-4">
              Ao enviar, você concorda com nossa Política de Privacidade.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex justify-center mb-8 pt-6">
        <Logo size="sm" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default KycScreen;
