
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import { AuthFormState } from '../types';
import { auth } from '../lib/auth';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormState>({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (isLogin) {
        const { error } = await auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        // Sign Up
        const { data, error } = await auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorMsg(error.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorational background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[20%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <div className="mb-10 text-center">
          <Logo size="lg" />
          <p className="mt-4 text-gray-400">
            {isLogin ? 'Bem-vindo de volta.' : 'Junte-se à revolução P2P.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl">
          {!isLogin && (
            <Input
              label="Nome Completo"
              name="name"
              placeholder="João Silva"
              icon={<UserIcon size={18} />}
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          
          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-4">
            <Button 
              fullWidth 
              variant="primary" 
              isLoading={loading}
              type="submit"
            >
              <span className="flex items-center gap-2">
                {isLogin ? 'Entrar no App' : 'Criar Conta'}
                {!loading && <ArrowRight size={18} />}
              </span>
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(null);
                setFormData(prev => ({ ...prev, name: '' }));
              }}
              className="text-secondary hover:text-white font-medium transition-colors"
            >
              {isLogin ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </p>
          <div className="mt-4 p-2 bg-surface/50 rounded text-xs text-gray-500">
            <p>Admin: admin@teste.com / 123456</p>
            <p>User: teste@teste.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
