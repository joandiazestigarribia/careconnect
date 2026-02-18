import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, ChevronUp, ChevronDown, LayoutDashboard } from 'lucide-react';

interface Props {
  className?: string;
  showBackButton?: boolean;
  showMessages?: boolean;
  onToggleMessages?: () => void;
}

const FamilyPanel = ({ 
  className = '', 
  showBackButton = false,
  showMessages = false,
  onToggleMessages,
}: Props) => {
  const navigate = useNavigate();

  return (
    <div className={`space-y-3 ${className}`}>
      {showBackButton && (
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-main hover:bg-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300"
        >
          <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-text-primary">Volver al Dashboard</span>
        </button>
      )}

      <button
        onClick={() => navigate('/profile')}
        className="w-full text-left px-4 py-4 rounded-2xl bg-surface hover:bg-primary/5 border-2 border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">Editar Perfil</span>
            <span className="text-xs text-text-secondary">Actualiza tus datos</span>
          </div>
        </div>
      </button>

      <button
        onClick={onToggleMessages}
        className="w-full text-left px-4 py-4 rounded-2xl bg-surface hover:bg-success/5 border-2 border-border hover:border-success/30 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-linear-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-text-primary block">
                {showMessages ? 'Ocultar' : 'Ver'} Mensajes
              </span>
              <span className="text-xs text-text-secondary">Comunicación con cuidadores</span>
            </div>
          </div>
          {showMessages ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </div>
      </button>
    </div>
  );
};

export default FamilyPanel;

export { default as ConversationList } from '../../messages/ConversationList';
export { default as Chat } from '../../messages/Chat';
