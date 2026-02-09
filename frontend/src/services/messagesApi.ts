import api from './api';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: User;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  family_id: string;
  family: User;
  caregiver_id: string;
  caregiver: User;
  last_message_id: string | null;
  last_message: Message | null;
  unread_family_count: number;
  unread_caregiver_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationDto {
  caregiver_id: string;
}

export interface CreateMessageDto {
  conversation_id: string;
  content: string;
}

export const messagesApi = {
  createConversation: async (data: CreateConversationDto): Promise<Conversation> => {
    const response = await api.post('/messages/conversations', data);
    return response.data.data;
  },

  getMyConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/messages/conversations/${id}`);
    return response.data.data;
  },

  getMessages: async (conversationId: string, limit = 50, offset = 0): Promise<Message[]> => {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  sendMessage: async (data: CreateMessageDto): Promise<Message> => {
    const response = await api.post('/messages/messages', data);
    return response.data.data;
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`/messages/conversations/${conversationId}/read`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/messages/unread-count');
    return response.data.data;
  },
};
