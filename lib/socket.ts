
import { chatTable } from './db';

type EventHandler = (data: any) => void;

class MockSocketService {
  private listeners: Record<string, EventHandler[]> = {};
  public id: string;

  constructor() {
    this.id = Math.random().toString(36).substr(2, 9);
    
    // Cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'alugaki_socket_event' && e.newValue) {
          const { event, data, senderSocketId } = JSON.parse(e.newValue);
          // Only process if it comes from another instance
          if (senderSocketId !== this.id) {
            this.triggerLocal(event, data);
          }
        }
      });
    }
  }

  on(event: string, callback: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventHandler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (event === 'join_room') {
      // No-op for mock
    } 
    else if (event === 'send_message') {
      // 1. Persist to DB synchronously
      const msg = chatTable.sendMessage(data.roomId, data.senderId, data.content);
      
      // 2. Trigger local listeners immediately (for the sender tab)
      // Note: The UI might have already optimistically updated, but this confirms it with the real ID.
      this.triggerLocal('new_message', msg);
      
      // 3. Broadcast to other tabs
      this.broadcastToOthers('new_message', msg);
    }
  }

  private triggerLocal(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  private broadcastToOthers(event: string, data: any) {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.setItem('alugaki_socket_event', JSON.stringify({
      event,
      data,
      timestamp: Date.now(),
      senderSocketId: this.id,
      nonce: Math.random() // Ensure storage event fires even if data matches
    }));
  }
}

export const socket = new MockSocketService();