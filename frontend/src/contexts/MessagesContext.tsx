import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocketContext, useSocketEvent } from './SocketContext';
import { messagesApi, type Conversation, type Message } from '../services/messagesApi';

interface MessagesContextType {
  conversations: Conversation[];
  unreadCount: number;
  isLoadingConversations: boolean;
  isLoadingUnread: boolean;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  loadConversations: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markConversationAsRead: (conversationId: string) => void;
}

const MessagesContext = createContext<MessagesContextType | null>(null);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected } = useSocketContext();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingUnread, setIsLoadingUnread] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const initializedRef = useRef(false);
  const loadingConversationsRef = useRef(false);
  const loadingUnreadRef = useRef(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const loadConversationsRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      initializedRef.current = false;
      setUnreadCount(0);
      setConversations([]);
      setActiveConversationId(null);
      processedMessageIds.current.clear();
      return;
    }
    
    if (!initializedRef.current) {
      initializedRef.current = true;
      
      setTimeout(() => {
        loadUnreadCount();
      }, 100);
      
      setTimeout(() => {
        loadConversations();
      }, 500);
    }
  }, [isAuthenticated, user?.id]);
  
  useEffect(() => {
    if (isConnected && user?.id && initializedRef.current) {
      loadUnreadCount();
    }
  }, [isConnected, user?.id]);

  useSocketEvent('new_message', (message: Message) => {
    if (processedMessageIds.current.has(message.id)) {
      return;
    }
    processedMessageIds.current.add(message.id);
  
    if (message.sender_id === user?.id) {
      return;
    }
    
    if (message.conversation_id === activeConversationId) {
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === message.conversation_id);
        if (convIndex === -1) {
          loadConversationsRef.current?.();
          return prev;
        }

        const updated = [...prev];
        const conv = { ...updated[convIndex] };
        
        conv.last_message = message;
        conv.last_message_id = message.id;
        
        updated.splice(convIndex, 1);
        updated.unshift(conv);
        
        return updated;
      });
      return;
    }
    
    setUnreadCount((prev) => prev + 1);
    
    setConversations((prev) => {
      const convIndex = prev.findIndex((c) => c.id === message.conversation_id);
      if (convIndex === -1) {
        loadConversationsRef.current?.();
        return prev;
      }

      const updated = [...prev];
      const conv = { ...updated[convIndex] };
      
      conv.last_message = message;
      conv.last_message_id = message.id;
      
      if (user?.role === 'FAMILY') {
        conv.unread_family_count += 1;
      } else {
        conv.unread_caregiver_count += 1;
      }
      
      updated.splice(convIndex, 1);
      updated.unshift(conv);
      
      return updated;
    });
  }, [user?.id, user?.role, activeConversationId]);

  const loadConversations = useCallback(async () => {
    if (loadingConversationsRef.current) return;
    loadingConversationsRef.current = true;
    
    setIsLoadingConversations(true);
    try {
      const convs = await messagesApi.getMyConversations();
      setConversations(convs);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoadingConversations(false);
      loadingConversationsRef.current = false;
    }
  }, []);
  
  loadConversationsRef.current = loadConversations;

  const loadUnreadCount = useCallback(async () => {
    if (loadingUnreadRef.current) return;
    loadingUnreadRef.current = true;
    
    setIsLoadingUnread(true);
    try {
      const count = await messagesApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    } finally {
      setIsLoadingUnread(false);
      loadingUnreadRef.current = false;
    }
  }, []);

  const markConversationAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unread_family_count: user?.role === 'FAMILY' ? 0 : conv.unread_family_count,
            unread_caregiver_count: user?.role === 'CAREGIVER' ? 0 : conv.unread_caregiver_count,
          };
        }
        return conv;
      })
    );
    
    setUnreadCount((prev) => Math.max(0, prev - 1));
    
    messagesApi.markAsRead(conversationId).catch(() => {});
  }, [user?.role]);

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        unreadCount,
        isLoadingConversations,
        isLoadingUnread,
        activeConversationId,
        setActiveConversationId,
        loadConversations,
        loadUnreadCount,
        markConversationAsRead,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
};
