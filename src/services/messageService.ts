
import { Message } from '@/types';
import { MOCK_MESSAGES } from './mockData';

// Mock service for messages
class MessageService {
  private messages: Message[] = [...MOCK_MESSAGES];

  async getAllMessages(): Promise<Message[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.messages];
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.messages.find(message => message.id === id);
  }

  async getMessagesBySenderId(senderId: string): Promise<Message[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.messages.filter(message => message.senderId === senderId);
  }

  async getMessagesByReceiverId(receiverId: string): Promise<Message[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.messages.filter(message => message.receiverId === receiverId);
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.messages.filter(
      message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(message: Omit<Message, 'id' | 'read' | 'createdAt'>): Promise<Message> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newMessage: Message = {
      ...message,
      id: (this.messages.length + 1).toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    this.messages.push(newMessage);
    return newMessage;
  }

  async markAsRead(id: string): Promise<Message | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.messages.findIndex(message => message.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedMessage: Message = {
      ...this.messages[index],
      read: true,
    };
    
    this.messages[index] = updatedMessage;
    return updatedMessage;
  }

  async markAllAsRead(receiverId: string): Promise<number> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let count = 0;
    
    this.messages = this.messages.map(message => {
      if (message.receiverId === receiverId && !message.read) {
        count++;
        return { ...message, read: true };
      }
      return message;
    });
    
    return count;
  }
}

export const messageService = new MessageService();
