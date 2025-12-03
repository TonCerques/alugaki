
export enum AppView {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  KYC = 'KYC',
  HOME = 'HOME'
}

export type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';

export interface AuthFormState {
  email: string;
  password: string;
  name?: string;
}

// --- DOMAIN ENTITIES (Matching Supabase Schema) ---

export enum KycStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface Profile {
  id: string; // UUID
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  kycStatus: KycStatus;
  createdAt: string;
}

export enum ItemCategory {
  CAMERA = 'Camera',
  DRONE = 'Drone',
  AUDIO = 'Audio',
  LIGHTING = 'Lighting',
  GAMING = 'Gaming',
  COMPUTING = 'Computing',
  VR = 'VR',
  OTHER = 'Other'
}

export interface Item {
  id: string; // UUID
  ownerId: string;
  title: string;
  description: string;
  category: ItemCategory;
  dailyPrice: number;
  replacementValue: number;
  minRentDays: number;
  images: string[];
  locationLat?: number;
  locationLng?: number;
  isActive: boolean;
  createdAt: string;
  // Analytics
  views?: number;
  bookingsCount?: number;
}

export enum BookingStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Step 1: User requests
  AWAITING_PAYMENT = 'AWAITING_PAYMENT', // Step 2: Owner approves
  CONFIRMED = 'CONFIRMED',               // Step 3: User pays
  ACTIVE = 'ACTIVE',                     // Step 4: Handover complete
  COMPLETED = 'COMPLETED',               // Step 5: Item returned
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export interface Booking {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  startDate: string; // ISO Date
  endDate: string;   // ISO Date
  totalPrice: number;
  depositAmount: number;
  status: BookingStatus;
  contractAccepted: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  participants: string[]; // [renterId, ownerId]
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface ContractLog {
  id: string;
  bookingId: string;
  userId: string;
  contractVersion: string;
  ipAddress: string;
  acceptedAt: string;
}
