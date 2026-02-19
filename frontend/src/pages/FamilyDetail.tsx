import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { familyApi, type FamilyProfile } from '../services/familyApi';
import { 
  MapPin, Users, Languages, ArrowLeft, 
  Heart, Baby, AlertCircle,
  MessageSquare
} from 'lucide-react';
import Chat from '../components/messages/Chat';
import 'leaflet/dist/leaflet.css';

const MapCenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

const FamilyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await familyApi.getById(id!);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar el perfil de la familia');
    } finally {
      setIsLoading(false);
    }
  };

  const getAgeRangeText = () => {
    if (!profile?.children_ages || profile.children_ages.length === 0) {
      return 'Edades no especificadas';
    }
    const minAge = Math.min(...profile.children_ages);
    const maxAge = Math.max(...profile.children_ages);
    if (minAge === maxAge) {
      return `${minAge} año${minAge !== 1 ? 's' : ''}`;
    }
    return `${minAge} - ${maxAge} años`;
  };

  const getLocationCoords = () => {
    if (!profile?.location) return null;
    const coords = profile.location.coordinates;
    return { lat: coords[1], lng: coords[0] };
  };

  const avatarUrl = profile ? `https://i.pravatar.cc/150?u=${profile.user_id}` : '';
  const locationCoords = getLocationCoords();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-600 mb-4">{error || 'Perfil no encontrado'}</p>
          <button
            onClick={() => navigate('/search')}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/search')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a búsqueda
      </button>

      {/* Profile Header */}
      <div className="bg-surface rounded-3xl shadow-xl shadow-primary/15 border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="relative">
            <img 
              src={avatarUrl}
              alt={`${profile.family_name}`}
              className="w-36 h-36 rounded-full object-cover shadow-2xl shadow-primary/40"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-36 h-36 bg-linear-to-br from-primary via-primary to-accent rounded-full flex items-center justify-center text-surface text-4xl font-bold shadow-2xl shadow-primary/40 ring-4 ring-white';
                  fallback.textContent = profile.family_name.charAt(0).toUpperCase();
                  parent.prepend(fallback);
                }
              }}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {profile.family_name}
            </h1>
            <p className="text-text-secondary">
              Familia buscando cuidador
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className={`space-y-6 ${showChat ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          
          {/* Información de los niños */}
          <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Baby className="w-6 h-6 text-surface" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Información de los niños</h2>
                <p className="text-sm text-text-secondary">{profile.children_count} hijo(s)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-bg-main rounded-2xl border-2 border-border">
                <div className="flex items-center gap-2 text-text-muted mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Cantidad</span>
                </div>
                <p className="text-xl font-bold text-text-primary">{profile.children_count}</p>
              </div>
              <div className="p-4 bg-bg-main rounded-2xl border-2 border-border">
                <div className="flex items-center gap-2 text-text-muted mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Rango de edades</span>
                </div>
                <p className="text-xl font-bold text-text-primary">{getAgeRangeText()}</p>
              </div>
            </div>
          </div>

          {/* Idiomas preferidos */}
          {profile.languages_preferred && profile.languages_preferred.length > 0 && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Languages className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Idiomas preferidos</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages_preferred.map((lang) => (
                  <span
                    key={lang}
                    className="px-4 py-2 bg-linear-to-r from-bg-main to-bg-main hover:from-primary/10 hover:to-primary-light/10 text-text-primary rounded-xl text-sm font-semibold border-2 border-border hover:border-primary/30 transition-all duration-300"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Necesidades especiales */}
          {profile.special_needs && profile.special_needs.length > 0 && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-warning/20 transition-all duration-300 shadow-lg shadow-warning/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-warning to-warning-dark rounded-2xl flex items-center justify-center shadow-lg shadow-warning/20">
                  <AlertCircle className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Necesidades especiales</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.special_needs.map((need) => (
                  <span
                    key={need}
                    className="px-4 py-2 bg-linear-to-r from-warning/10 to-warning-dark/10 text-warning-dark rounded-xl text-sm font-semibold border-2 border-warning/20 hover:border-warning/40 transition-all duration-300"
                  >
                    {need}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ubicación aproximada con mapa */}
          {locationCoords && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-success to-success-dark rounded-2xl flex items-center justify-center shadow-lg shadow-success/20">
                  <MapPin className="w-6 h-6 text-surface" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Ubicación aproximada</h2>
                  <p className="text-sm text-text-secondary">Área general donde reside la familia</p>
                </div>
              </div>
              
              {/* Mapa con área aproximada */}
              <div className="h-[250px] rounded-2xl overflow-hidden border border-border">
                <MapContainer
                  center={[locationCoords.lat, locationCoords.lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                  dragging={false}
                  zoomControl={false}
                >
                  <MapCenter lat={locationCoords.lat} lng={locationCoords.lng} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Círculo de área aproximada (1km radio) */}
                  <Circle
                    center={[locationCoords.lat, locationCoords.lng]}
                    radius={1000}
                    pathOptions={{ 
                      color: '#6366F1', 
                      fillColor: '#6366F1', 
                      fillOpacity: 0.2, 
                      weight: 2,
                      dashArray: '5, 10'
                    }}
                  />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {showChat && (
            <div className="bg-surface rounded-3xl border-2 border-border p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Chat con {profile.family_name}</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-bg-main transition-colors"
                >
                  Cerrar chat
                </button>
              </div>
              <div className="min-h-[450px]">
                <Chat
                  caregiverId={id}
                  caregiverName={profile.family_name}
                  conversationId={conversationId}
                  onConversationCreated={(id) => setConversationId(id)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`lg:col-span-1 ${showChat ? 'hidden lg:hidden' : 'block'}`}>
          <div className="sticky top-20 space-y-4">
            {/* Tarjeta de Contacto */}
            <div className="bg-surface rounded-3xl border-2 border-primary/20 shadow-xl shadow-primary/10 p-6">
              <div className="text-center mb-6">
                <p className="text-text-muted text-sm mb-1">¿Interesado en cuidar a esta familia?</p>
                <p className="text-lg font-bold text-text-primary">Contacta ahora</p>
              </div>

              <button 
                onClick={() => setShowChat(true)}
                className="w-full py-4 bg-linear-to-r from-primary to-accent text-surface font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Contactar a {profile.family_name}
              </button>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-text-secondary text-center">
                  Al contactar, la familia podrá ver tu perfil y decidir si eres adecuado para cuidar a sus hijos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDetail;
