import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../contexts/MessagesContext';
import { MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  onSelectConversation: (conversation: any) => void;
  selectedId?: string;
}

const ConversationList = ({ onSelectConversation, selectedId }: Props) => {
  const { user } = useAuth();
  const { conversations, isLoadingConversations, markConversationAsRead } = useMessages();

  const getUnreadCount = (conv: any) => {
    if (!user) return 0;
    return user.role === 'FAMILY'
      ? conv.unread_family_count
      : conv.unread_caregiver_count;
  };

  const getOtherPersonName = (conv: any) => {
    if (!user) return 'Conversación';

    if (user.role === 'FAMILY') {
      return conv.caregiver?.caregiver_profile?.first_name + ' ' + conv.caregiver?.caregiver_profile?.last_name ||
        conv.caregiver?.email ||
        'Cuidador';
    } else {
      return conv.family?.family_profile?.family_name ||
        conv.family?.email ||
        'Familia';
    }
  };

  const getAvatarInitial = (conv: any) => {
    const name = getOtherPersonName(conv);
    return name[0]?.toUpperCase() || '?';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return date.toLocaleDateString('es-AR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }
  };

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-2xl flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/10">
          <MessageSquare className="w-10 h-10 text-primary" />
        </div>
        <p className="text-text-secondary font-medium">No tienes conversaciones aún</p>
        <p className="text-sm text-text-muted mt-1">
          Contacta a un cuidador para iniciar una conversación
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const unread = getUnreadCount(conv);
        const isSelected = selectedId === conv.id;

        return (
          <button
            key={conv.id}
            onClick={() => {
              if (unread > 0) {
                markConversationAsRead(conv.id);
              }
              onSelectConversation(conv);
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 text-left ${isSelected
              ? 'bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/30 shadow-md shadow-primary/10'
              : 'bg-surface border-2 border-border hover:border-primary/30 hover:shadow-md'
              }`}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <span className="text-white font-bold text-lg">
                {getAvatarInitial(conv)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary truncate">
                  {getOtherPersonName(conv)}
                </h4>
                {conv.last_message && (
                  <span className="text-xs text-text-muted font-medium">
                    {formatTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm text-text-secondary truncate flex-1">
                  {conv.last_message
                    ? conv.last_message.content
                    : 'Sin mensajes'}
                </p>
                {unread > 0 && (
                  <span className="shrink-0 w-6 h-6 bg-gradient-to-br from-primary to-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md shadow-primary/20">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
