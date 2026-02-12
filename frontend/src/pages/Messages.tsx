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
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header mejorado con icono en gradiente */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 group"
        >
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver al inicio
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-xl shadow-accent/20">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Mensajes</h1>
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
          <div className="bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-xl shadow-primary/5 p-5 hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              Conversaciones
            </h2>
            <ConversationList
              onSelectConversation={setSelectedConversation}
              selectedId={selectedConversation?.id}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
          {selectedConversation ? (
            <div className="bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-xl shadow-primary/5 p-5 hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-primary/10 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-text-primary">Chat</h2>
              </div>
              <Chat
                conversationId={selectedConversation.id}
                onBack={() => setSelectedConversation(null)}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-xl shadow-primary/5 p-8 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-accent/10">
                <MessageSquare className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
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
