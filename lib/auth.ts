import { userTable, profileTable } from './db';

const SESSION_KEY = 'neon_rental_session';

type AuthSubscriber = (event: string, session: any) => void;
let subscribers: AuthSubscriber[] = [];

const notifySubscribers = (event: string, session: any) => {
  subscribers.forEach(cb => cb(event, session));
};

export const auth = {
  signUp: async ({ email, password, options }: any) => {
    // Simular delay de rede
    await new Promise(r => setTimeout(r, 600));
    
    try {
      // 1. Criar Auth User
      const user = userTable.create(email, password); // Num app real, usaríamos hash bcrypt
      
      // 2. Trigger de Criação de Perfil
      const fullName = options?.data?.full_name || email.split('@')[0];
      const profile = profileTable.create(user.id, email, fullName);
      
      // 3. Auto Login
      const session = { 
        user: { id: user.id, email: user.email }, 
        access_token: 'mock-jwt-token-' + Date.now() 
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      notifySubscribers('SIGNED_IN', session);
      
      return { data: { user, session }, error: null };
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },
  
  signInWithPassword: async ({ email, password }: any) => {
    await new Promise(r => setTimeout(r, 600));
    
    const user = userTable.findByEmail(email);
    
    if (!user || user.passwordHash !== password) {
       return { error: { message: 'Invalid credentials' } };
    }
    
    const session = { 
      user: { id: user.id, email: user.email }, 
      access_token: 'mock-jwt-token-' + Date.now() 
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    notifySubscribers('SIGNED_IN', session);
    
    return { data: { session }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem(SESSION_KEY);
    notifySubscribers('SIGNED_OUT', null);
    return { error: null };
  },

  getSession: async () => {
    const stored = localStorage.getItem(SESSION_KEY);
    const session = stored ? JSON.parse(stored) : null;
    return { data: { session } };
  },

  onAuthStateChange: (callback: AuthSubscriber) => {
    subscribers.push(callback);
    
    // Chamada inicial imediata
    const stored = localStorage.getItem(SESSION_KEY);
    const session = stored ? JSON.parse(stored) : null;
    callback(session ? 'INITIAL_SESSION' : 'INITIAL_NO_SESSION', session);
    
    return { 
      data: { 
        subscription: { 
          unsubscribe: () => {
            subscribers = subscribers.filter(s => s !== callback);
          } 
        } 
      } 
    };
  }
};