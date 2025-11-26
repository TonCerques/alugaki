
import { Profile, Item, Booking, KycStatus, BookingStatus, ItemCategory, ChatRoom, ChatMessage, ContractLog } from '../types';

// Utilitário para gerar IDs únicos (UUID v4 fake)
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Estrutura do Banco de Dados
interface Schema {
  users: Array<{ id: string; email: string; passwordHash: string; created_at: string }>;
  profiles: Profile[];
  items: Item[];
  bookings: Booking[];
  verification_logs: Array<{ id: string; userId: string; documentType: string; status: string; timestamp: string }>;
  chat_rooms: ChatRoom[];
  messages: ChatMessage[];
  contract_logs: ContractLog[];
}

const DB_KEY = 'alugaki_db_v1';

// --- SEED DATA ---
const SEED_USERS = [
  { id: 'admin-user', email: 'admin@teste.com', passwordHash: '123456', created_at: new Date().toISOString() },
  { id: 'test-user', email: 'teste@teste.com', passwordHash: '123456', created_at: new Date().toISOString() }
];

const SEED_PROFILES: Profile[] = [
  {
    id: 'admin-user',
    email: 'admin@teste.com',
    fullName: 'Alugaki Oficial',
    avatarUrl: '',
    bio: 'Locadora parceira oficial da Alugaki.',
    kycStatus: KycStatus.VERIFIED,
    createdAt: new Date().toISOString()
  },
  {
    id: 'test-user',
    email: 'teste@teste.com',
    fullName: 'Usuário Teste',
    avatarUrl: '',
    bio: 'Cineasta independente.',
    kycStatus: KycStatus.VERIFIED,
    createdAt: new Date().toISOString()
  }
];

const SEED_ITEMS: Item[] = [
  {
    id: 'item-1',
    ownerId: 'admin-user',
    title: 'Kit Cinema Sony A7S III',
    description: 'Kit completo com lente 24-70mm GM, 2 baterias e filtros ND. Perfeito para vídeo em baixa luz.',
    category: ItemCategory.CAMERA,
    dailyPrice: 150,
    replacementValue: 3500,
    minRentDays: 2,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'item-2',
    ownerId: 'admin-user',
    title: 'DJI Mavic 3 Cine',
    description: 'Suporte a ProRes. Inclui 3 baterias e controle RC Pro. Fly More Combo.',
    category: ItemCategory.DRONE,
    dailyPrice: 200,
    replacementValue: 5000,
    minRentDays: 1,
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=1000'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'item-3',
    ownerId: 'admin-user',
    title: 'Aputure 600d Pro',
    description: 'LED de alta potência. Inclui softbox e tripé heavy-duty.',
    category: ItemCategory.LIGHTING,
    dailyPrice: 85,
    replacementValue: 1800,
    minRentDays: 1,
    images: ['https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&q=80&w=1000'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// --- Core DB Engine ---

const getDb = (): Schema => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    let db: Schema;

    if (!stored) {
      // Seed inicial se vazio
      db = { 
        users: [...SEED_USERS], 
        profiles: [...SEED_PROFILES], 
        items: [...SEED_ITEMS], 
        bookings: [],
        verification_logs: [],
        chat_rooms: [],
        messages: [],
        contract_logs: []
      };
      saveDb(db);
      return db;
    } else {
      db = JSON.parse(stored);
    }

    // --- SELF HEALING / MIGRATIONS ---
    let dirty = false;

    // Ensure users exist
    if (!db.users.find(u => u.id === 'admin-user')) {
      db.users.push(SEED_USERS[0]);
      db.profiles.push(SEED_PROFILES[0]);
      dirty = true;
    }
    if (!db.users.find(u => u.id === 'test-user')) {
      db.users.push(SEED_USERS[1]);
      db.profiles.push(SEED_PROFILES[1]);
      dirty = true;
    }

    // Ensure Items belong to admin
    db.items.forEach(item => {
      if (item.ownerId === 'user-demo') {
        item.ownerId = 'admin-user';
        dirty = true;
      }
    });

    if (dirty) saveDb(db);
    
    return db;
  } catch (e) {
    console.error("DB Corruption", e);
    // Emergency Reset if corrupted
    return { users: [], profiles: [], items: [], bookings: [], verification_logs: [], chat_rooms: [], messages: [], contract_logs: [] };
  }
};

const saveDb = (db: Schema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- Tabela USERS ---
export const userTable = {
  create: (email: string, passwordHash: string) => {
    const db = getDb();
    if (db.users.find(u => u.email === email)) {
      throw new Error('Usuário já existe');
    }
    const newUser = { 
      id: generateId(), 
      email, 
      passwordHash, 
      created_at: new Date().toISOString() 
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },
  findByEmail: (email: string) => getDb().users.find(u => u.email === email),
  findById: (id: string) => getDb().users.find(u => u.id === id),
};

// --- Tabela PROFILES ---
export const profileTable = {
  create: (userId: string, email: string, fullName: string) => {
    const db = getDb();
    const newProfile: Profile = {
      id: userId, // Chave primária igual ao UserID (1:1)
      email,
      fullName,
      kycStatus: KycStatus.UNVERIFIED,
      createdAt: new Date().toISOString()
    };
    db.profiles.push(newProfile);
    saveDb(db);
    return newProfile;
  },
  find: (userId: string) => getDb().profiles.find(p => p.id === userId),
  update: (userId: string, updates: Partial<Profile>) => {
    const db = getDb();
    const index = db.profiles.findIndex(p => p.id === userId);
    if (index === -1) return null;
    
    db.profiles[index] = { ...db.profiles[index], ...updates };
    saveDb(db);
    return db.profiles[index];
  },
  updateKycStatus: (userId: string, status: KycStatus) => {
    const db = getDb();
    const index = db.profiles.findIndex(p => p.id === userId);
    if (index === -1) return null;

    db.profiles[index].kycStatus = status;
    saveDb(db);
    return db.profiles[index];
  }
};

// --- Tabela ITEMS ---
export const itemTable = {
  create: (item: Omit<Item, 'id' | 'createdAt' | 'isActive'>) => {
    const db = getDb();
    const newItem: Item = {
      ...item,
      id: generateId(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    db.items.unshift(newItem); // Adiciona no início
    saveDb(db);
    return newItem;
  },
  findAll: () => {
    return getDb().items.filter(i => i.isActive);
  },
  findById: (id: string) => {
    return getDb().items.find(i => i.id === id);
  },
  findByOwner: (ownerId: string) => {
    return getDb().items.filter(i => i.ownerId === ownerId);
  }
};

// --- Tabela BOOKINGS ---
export const bookingTable = {
  create: (booking: Omit<Booking, 'id' | 'status' | 'contractAccepted' | 'createdAt'>) => {
    const db = getDb();
    
    // --- AUTO-APPROVE LOGIC FOR DEMO ---
    // Automatically approve bookings for the Mavic 3 Cine (item-2)
    const isAutoApprove = booking.itemId === 'item-2';
    const initialStatus = isAutoApprove ? BookingStatus.AWAITING_PAYMENT : BookingStatus.PENDING_APPROVAL;

    const newBooking: Booking = {
      ...booking,
      id: generateId(),
      status: initialStatus,
      contractAccepted: false,
      createdAt: new Date().toISOString()
    };
    db.bookings.push(newBooking);
    
    // Create linked Chat Room automatically
    const chatRoom: ChatRoom = {
      id: generateId(),
      bookingId: newBooking.id,
      participants: [booking.renterId, booking.ownerId],
      updatedAt: new Date().toISOString()
    };
    db.chat_rooms.push(chatRoom);
    
    // Initial System Message (Translated)
    const initialContent = isAutoApprove 
      ? `Solicitação de reserva para ${new Date(booking.startDate).toLocaleDateString('pt-BR')}. \n\n⚡ AUTO-APROVADO (Demo): Você pode prosseguir para o pagamento imediatamente.`
      : `Solicitação de reserva para ${new Date(booking.startDate).toLocaleDateString('pt-BR')}. Aguardando aprovação do proprietário.`;

    const sysMsg: ChatMessage = {
      id: generateId(),
      roomId: chatRoom.id,
      senderId: 'system',
      content: initialContent,
      createdAt: new Date().toISOString()
    };
    db.messages.push(sysMsg);

    saveDb(db);
    return { booking: newBooking, chatRoomId: chatRoom.id };
  },
  findById: (id: string) => {
    return getDb().bookings.find(b => b.id === id);
  },
  findByUser: (userId: string) => {
    return getDb().bookings.filter(b => b.renterId === userId || b.ownerId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },
  updateStatus: (id: string, status: BookingStatus) => {
    const db = getDb();
    const index = db.bookings.findIndex(b => b.id === id);
    if (index === -1) return null;
    db.bookings[index].status = status;
    saveDb(db);
    return db.bookings[index];
  },
  confirmPayment: (id: string, userId: string) => {
    const db = getDb();
    const index = db.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Booking not found");

    // 1. Update Booking Status
    db.bookings[index].status = BookingStatus.CONFIRMED;
    db.bookings[index].contractAccepted = true;

    // 2. Create Contract Log
    const contractLog: ContractLog = {
      id: generateId(),
      bookingId: id,
      userId: userId,
      contractVersion: 'v1.0-MVP-BR',
      ipAddress: '127.0.0.1 (Mock)',
      acceptedAt: new Date().toISOString()
    };
    db.contract_logs.push(contractLog);

    // 3. System Message in Chat
    const room = db.chat_rooms.find(r => r.bookingId === id);
    if (room) {
      const msg: ChatMessage = {
        id: generateId(),
        roomId: room.id,
        senderId: 'system',
        content: `Pagamento confirmado! Caução pré-autorizada. Combine a entrega com o proprietário agora.`,
        createdAt: new Date().toISOString()
      };
      db.messages.push(msg);
      room.updatedAt = new Date().toISOString();
    }

    saveDb(db);
    return db.bookings[index];
  },
  handover: (id: string) => {
    const db = getDb();
    const index = db.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Booking not found");

    db.bookings[index].status = BookingStatus.ACTIVE;
    
    const room = db.chat_rooms.find(r => r.bookingId === id);
    if (room) {
      const msg: ChatMessage = {
        id: generateId(),
        roomId: room.id,
        senderId: 'system',
        content: `Entrega confirmada. O período de locação começou. Fotos de vistoria salvas.`,
        createdAt: new Date().toISOString()
      };
      db.messages.push(msg);
      room.updatedAt = new Date().toISOString();
    }
    saveDb(db);
  },
  returnItem: (id: string) => {
    const db = getDb();
    const index = db.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Booking not found");

    db.bookings[index].status = BookingStatus.COMPLETED;
    
    const room = db.chat_rooms.find(r => r.bookingId === id);
    if (room) {
      const msg: ChatMessage = {
        id: generateId(),
        roomId: room.id,
        senderId: 'system',
        content: `Item devolvido. Vistoria aprovada. Caução liberada.`,
        createdAt: new Date().toISOString()
      };
      db.messages.push(msg);
      room.updatedAt = new Date().toISOString();
    }
    saveDb(db);
  }
};

// --- Tabela CHAT ---
export const chatTable = {
  getRoomsByUser: (userId: string) => {
    const db = getDb();
    return db.chat_rooms
      .filter(r => r.participants.includes(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  getMessages: (roomId: string) => {
    return getDb().messages.filter(m => m.roomId === roomId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  sendMessage: (roomId: string, senderId: string, content: string) => {
    const db = getDb();
    const msg: ChatMessage = {
      id: generateId(),
      roomId,
      senderId,
      content,
      createdAt: new Date().toISOString()
    };
    db.messages.push(msg);
    
    // Update room timestamp
    const rIndex = db.chat_rooms.findIndex(r => r.id === roomId);
    if (rIndex !== -1) {
      db.chat_rooms[rIndex].updatedAt = new Date().toISOString();
    }
    
    saveDb(db);
    return msg;
  },
  findRoomByBookingId: (bookingId: string) => {
    return getDb().chat_rooms.find(r => r.bookingId === bookingId);
  }
};

// --- Tabela VERIFICATION LOGS ---
export const verificationTable = {
  create: (userId: string, documentType: string) => {
    const db = getDb();
    const log = {
      id: generateId(),
      userId,
      documentType,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    db.verification_logs.push(log);
    
    // Update profile status as well
    const profileIndex = db.profiles.findIndex(p => p.id === userId);
    if (profileIndex !== -1) {
      db.profiles[profileIndex].kycStatus = KycStatus.PENDING;
    }
    
    saveDb(db);
    return log;
  }
};

// --- Acesso Genérico para debug ---
export const rawDb = {
  get: getDb,
  reset: () => localStorage.removeItem(DB_KEY)
};