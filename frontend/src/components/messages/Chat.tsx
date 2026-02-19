import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocketContext, useSocketEvent } from '../../contexts/SocketContext';
import { useMessages } from '../../contexts/MessagesContext';
import { messagesApi, type Message } from '../../services/messagesApi';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

interface Props {
  conversationId?: string;
  caregiverId?: string;
  caregiverName?: string;
  onBack?: () => void;
  onConversationCreated?: (id: string) => void;
}

const Chat = ({ conversationId, caregiverId, caregiverName, onBack, onConversationCreated }: Props) => {
  const { user } = useAuth();
  const { isConnected, joinConversation, leaveConversation, sendMessage, setTyping } = useSocketContext();
  const { markConversationAsRead } = useMessages();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentConvIdRef = useRef<string | null>(null);
  const loadingConvRef = useRef(false);
  const loadingMessagesRef = useRef(false);
  const markedAsReadRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    markedAsReadRef.current.clear();

    const init = async () => {
      if (conversationId) {
        currentConvIdRef.current = conversationId;
        await loadConversation(conversationId);
      } else if (caregiverId) {
        await createConversation(caregiverId);
      }
    };

    init();
  }, [conversationId, caregiverId]);

  useEffect(() => {
    if (!isConnected || !conversation?.id) return;

    joinConversation(conversation.id);
    currentConvIdRef.current = conversation.id;

    loadMessages(conversation.id);

    if (!markedAsReadRef.current.has(conversation.id)) {
      markedAsReadRef.current.add(conversation.id);
      markConversationAsRead(conversation.id);
    }

    return () => {
      if (currentConvIdRef.current) {
        leaveConversation(currentConvIdRef.current);
      }
    };
  }, [isConnected, conversation?.id]);

  useSocketEvent('new_message', (message) => {
    if (message.conversation_id === currentConvIdRef.current) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => {
          if (m.id.startsWith('temp-') && m.content === message.content && m.sender_id === message.sender_id) {
            return false;
          }
          return true;
        });

        if (filtered.some((m) => m.id === message.id)) return filtered;
        return [...filtered, message];
      });
    }
  }, []);

  useSocketEvent('typing', (data) => {
    if (data.userId !== user?.id) {
      setOtherUserTyping(data.isTyping);
    }
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const [error, setError] = useState<string | null>(null);

  const createConversation = async (cId: string) => {
    try {
      setError(null);
      const conv = await messagesApi.createConversation({ caregiver_id: cId });
      setConversation(conv);
      onConversationCreated?.(conv.id);
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        setError('No se pudo iniciar la conversación. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    if (loadingConvRef.current) return;
    loadingConvRef.current = true;

    try {
      setError(null);
      const conv = await messagesApi.getConversation(id);
      setConversation(conv);
    } catch (err: any) {
      console.error('Error loading conversation:', err);
      if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    } finally {
      setIsLoading(false);
      loadingConvRef.current = false;
    }
  };

  const loadMessages = async (convId: string) => {
    if (loadingMessagesRef.current) return;
    loadingMessagesRef.current = true;

    try {
      const msgs = await messagesApi.getMessages(convId, 100);
      setMessages([...msgs].reverse());
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      loadingMessagesRef.current = false;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation?.id) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: user?.id || '',
      sender: user as any,
      content,
      status: 'sent',
      read_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    sendMessage(conversation.id, content);

    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const handleTyping = () => {
    if (!conversation?.id || !isConnected) return;

    setTyping(conversation.id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(conversation.id, false);
    }, 2000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const getOtherParticipantName = () => {
    if (caregiverName) return caregiverName;

    if (!user || !conversation) {
      return 'Conversación';
    }

    if (user.role === 'FAMILY') {
      const first =
        conversation.caregiver?.caregiver_profile?.first_name ?? '';
      const last =
        conversation.caregiver?.caregiver_profile?.last_name ?? '';
      const fullName = `${first} ${last}`.trim();

      return (
        fullName ||
        conversation.caregiver?.email ||
        'Cuidador'
      );
    } else {
      return (
        conversation.family?.family_profile?.family_name ||
        conversation.family?.email ||
        'Familia'
      );
    }
  };

  const isMyMessage = (message: Message) => message.sender_id === user?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 bg-linear-to-br from-primary/10 to-primary-light/10 rounded-2xl flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-surface rounded-3xl border-2 border-border overflow-hidden shadow-xl shadow-primary/5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-linear-to-r from-bg-main to-surface">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-11 h-11 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-md shadow-primary/20">
          <span className="text-white font-bold text-lg">
            {getOtherParticipantName()[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-text-primary">{getOtherParticipantName()}</h3>
          <div className="flex items-center gap-2">
            {otherUserTyping && (
              <span className="text-xs text-primary font-medium">• escribiendo...</span>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <div className="w-16 h-16 bg-linear-to-br from-primary/10 to-primary-light/10 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
            <p className="font-medium">No hay mensajes aún</p>
            <p className="text-sm text-text-muted">¡Envía el primer mensaje!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const showDate = index === 0 ||
              formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-text-muted bg-bg-main px-4 py-1.5 rounded-full font-medium border border-border shadow-sm">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${isMyMessage(message)
                      ? 'bg-linear-to-br from-primary to-primary-light text-white rounded-br-md shadow-primary/20'
                      : 'bg-bg-main text-text-primary rounded-bl-md border border-border'
                    }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isMyMessage(message) ? 'text-white/70' : 'text-text-muted'
                      }`}>
                      <span className="font-medium">{formatTime(message.created_at)}</span>
                      {isMyMessage(message) && !message.id.startsWith('temp-') && (
                        <span>{message.status === 'read' ? '✓✓' : '✓'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-linear-to-r from-bg-main to-surface">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-3 bg-surface border-2 border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm"
            disabled={isSending || !conversation || !!error}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim() || !conversation || !!error}
            className="px-5 py-3 bg-linear-to-r from-primary to-primary-light text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-primary/20 hover:scale-105"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
