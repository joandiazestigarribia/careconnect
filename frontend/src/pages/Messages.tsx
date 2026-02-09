import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { messagesApi, type Conversation } from '../services/messagesApi';
import ConversationList from '../components/messages/ConversationList';
import Chat from '../components/messages/Chat';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Mensajes</h1>
            <p className="text-text-secondary">
              {user.role === 'FAMILY' 
                ? 'Comunícate con los cuidadores' 
                : 'Responde a las familias interesadas'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Conversaciones</h2>
            <ConversationList
              onSelectConversation={setSelectedConversation}
              selectedId={selectedConversation?.id}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
          {selectedConversation ? (
            <div className="bg-surface rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-border rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-text-primary">Chat</h2>
              </div>
              <Chat
                conversationId={selectedConversation.id}
                onBack={() => setSelectedConversation(null)}
              />
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-text-secondary text-center max-w-sm">
                {user.role === 'FAMILY'
                  ? 'Elige un cuidador para chatear'
                  : 'Espera a que las familias te contacten'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
