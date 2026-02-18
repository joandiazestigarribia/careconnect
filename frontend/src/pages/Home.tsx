import { Heart, Search, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaregiverPanel, { AvailabilityCalendar, Chat, ConversationList } from '../components/search/common/CaregiverPanel';
import FamilyPanel, { Chat as FamilyChat, ConversationList as FamilyConversationList } from '../components/search/common/FamilyPanel';
import { useAuth } from '../hooks/useAuth';
import type { Conversation } from '../services/messagesApi';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAvailability, setShowAvailability] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [familyShowMessages, setFamilyShowMessages] = useState(false);
  const [familySelectedConversation, setFamilySelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user?.profile_completed) {
      navigate('/complete-profile');
    }
  }, [user?.profile_completed, navigate]);

  if (!user) {
    return null;
  }

  if (user.role === 'FAMILY') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Encuentra tu Cuidador Ideal
              </h1>
            </div>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl">
            Gestiona tu perfil y encuentra el cuidador perfecto para tu familia.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/10 border border-border p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center shadow-xl shadow-accent/20">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Panel de Familia</h2>
                <p className="text-text-secondary text-sm">Gestiona tu perfil y encuentra cuidadores</p>
              </div>
            </div>

            {/* Grid de acciones - 2 columnas balanceadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Columna izquierda: Panel de acciones */}
              <FamilyPanel
                className="h-full"
                showMessages={familyShowMessages}
                onToggleMessages={() => {
                  setFamilyShowMessages(!familyShowMessages);
                  setFamilySelectedConversation(null);
                }}
              />

              {/* Columna derecha: Buscar Cuidadores */}
              <div className="flex flex-col gap-4">
                {/* Card principal: Buscar Cuidadores */}
                <div
                  onClick={() => navigate('/search')}
                  className="p-6 bg-surface rounded-2xl border-2 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group bg-linear-to-br from-primary/5 to-transparent min-h-[180px] flex gap-3 justify-center items-center"
                >
                  <div>
                    <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Buscar Cuidadores</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Encuentra cuidadores calificados cerca de tu zona que se adapten a las necesidades de tu familia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido desplegable - ocupa todo el ancho debajo del grid */}
            {familyShowMessages && (
              <div className="mt-4 bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  Mis Mensajes
                </h3>
                {familySelectedConversation ? (
                  <FamilyChat
                    conversationId={familySelectedConversation.id}
                    onBack={() => setFamilySelectedConversation(null)}
                  />
                ) : (
                  <FamilyConversationList
                    onSelectConversation={(conv: Conversation) => setFamilySelectedConversation(conv)}
                    selectedId={undefined}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Tus Servicios
            </h1>
          </div>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl">
          Gestiona tu disponibilidad, servicios y conecta con familias que necesitan tu ayuda.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/10 border border-border p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-success to-success-light rounded-2xl flex items-center justify-center shadow-xl shadow-success/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Panel de Cuidador</h2>
              <p className="text-text-secondary text-sm">Gestiona tu perfil y conecta con familias</p>
            </div>
          </div>

          {/* Grid de acciones - 2 columnas balanceadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Columna izquierda: Panel de acciones */}
            <CaregiverPanel
              className="h-full"
              showAvailability={showAvailability}
              onToggleAvailability={() => {
                setShowAvailability(!showAvailability);
                setShowMessages(false);
              }}
              showMessages={showMessages}
              onToggleMessages={() => {
                setShowMessages(!showMessages);
                setSelectedConversation(null);
              }}
            />

            {/* Columna derecha: Buscar Familias */}
            <div className="flex flex-col gap-4">
              {/* Card principal: Buscar Familias */}
              <div
                onClick={() => navigate('/search')}
                className="p-6 bg-surface rounded-2xl border-2 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group bg-linear-to-br from-primary/5 to-transparent min-h-[180px] flex gap-3 justify-center items-center"
              >
                <div>
                  <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Buscar Familias</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Explora y conecta con familias en tu zona que están buscando un cuidador como tú.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido desplegable - ocupa todo el ancho debajo del grid */}
          {showAvailability && (
            <div className="mt-4 bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Mi Disponibilidad Semanal
              </h3>
              <AvailabilityCalendar />
            </div>
          )}

          {showMessages && (
            <div className="mt-4 bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-lg">
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
      </div>
    </div>
  );
};

export default Home;
