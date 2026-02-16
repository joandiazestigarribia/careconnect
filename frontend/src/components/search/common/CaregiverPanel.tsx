import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, MessageSquare, ChevronUp, ChevronDown, LayoutDashboard } from 'lucide-react';
import AvailabilityCalendar from '../../caregiver/AvailabilityCalendar';
import ConversationList from '../../messages/ConversationList';
import Chat from '../../messages/Chat';
import type { Conversation } from '../../../services/messagesApi';

interface Props {
  className?: string;
  showBackButton?: boolean;
}

const CaregiverPanel = ({ className = '', showBackButton = false }: Props) => {
  const navigate = useNavigate();
  const [showAvailability, setShowAvailability] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className={`bg-surface rounded-3xl shadow-lg shadow-primary/5 border-2 border-border p-6 ${className}`}>
      <h3 className="font-bold text-text-primary mb-4">Panel de Cuidador</h3>
      
      <div className="space-y-3">
        {showBackButton && (
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-main hover:bg-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-text-primary">Volver al Dashboard</span>
          </button>
        )}

        <button
          onClick={() => navigate('/profile')}
          className="w-full text-left px-4 py-3 rounded-2xl bg-bg-main hover:bg-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-text-primary">Editar Perfil</span>
          </div>
        </button>

        <button
          onClick={() => setShowAvailability(!showAvailability)}
          className="w-full text-left px-4 py-3 rounded-2xl bg-bg-main hover:bg-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-text-primary">
                {showAvailability ? 'Ocultar' : 'Ver'} Disponibilidad
              </span>
            </div>
            {showAvailability ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </div>
        </button>

        <button
          onClick={() => {
            setShowMessages(!showMessages);
            setSelectedConversation(null);
          }}
          className="w-full text-left px-4 py-3 rounded-2xl bg-bg-main hover:bg-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-text-primary">
                {showMessages ? 'Ocultar' : 'Ver'} Mensajes
              </span>
            </div>
            {showMessages ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </div>
        </button>
      </div>

      {/* Availability Calendar */}
      {showAvailability && (
        <div className="mt-4 bg-surface rounded-3xl border border-border p-4 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Mi Disponibilidad Semanal
          </h3>
          <AvailabilityCalendar />
        </div>
      )}

      {/* Messages */}
      {showMessages && (
        <div className="mt-4 bg-surface rounded-3xl border border-border p-4 shadow-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Mis Mensajes
          </h3>
          {selectedConversation ? (
            <Chat
              conversationId={selectedConversation.id}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <ConversationList
              onSelectConversation={(conv: Conversation) => setSelectedConversation(conv)}
              selectedId={undefined}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CaregiverPanel;
