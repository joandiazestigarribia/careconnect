import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caregiverProfileApi, type CaregiverProfile } from '../services/profileApi';
import { availabilityApi, DAYS_OF_WEEK, type Availability, type DayOfWeek } from '../services/availabilityApi';
import { MapPin, DollarSign, Award, Users, Languages, Sparkles, ArrowLeft, Clock, Calendar, MessageSquare } from 'lucide-react';
import Chat from '../components/messages/Chat';

const CaregiverDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
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
      const [profileData, availabilityData] = await Promise.all([
        caregiverProfileApi.getById(id!),
        availabilityApi.getByCaregiver(id!),
      ]);
      setProfile(profileData);
      setAvailability(availabilityData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilitiesForDay = (day: DayOfWeek) => {
    return availability
      .filter(a => a.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getDayGradient = (day: DayOfWeek) => {
    const gradients: Record<DayOfWeek, string> = {
      monday: 'bg-gradient-to-br from-blue-500 to-blue-600',
      tuesday: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      wednesday: 'bg-gradient-to-br from-purple-500 to-purple-600',
      thursday: 'bg-gradient-to-br from-pink-500 to-pink-600',
      friday: 'bg-gradient-to-br from-rose-500 to-rose-600',
      saturday: 'bg-gradient-to-br from-orange-500 to-orange-600',
      sunday: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    };
    return gradients[day];
  };

  const getDayBgGradient = (day: DayOfWeek) => {
    const gradients: Record<DayOfWeek, string> = {
      monday: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200',
      tuesday: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200',
      wednesday: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200',
      thursday: 'bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200',
      friday: 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200',
      saturday: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200',
      sunday: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200',
    };
    return gradients[day];
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-600 mb-4">{error || 'Perfil no encontrado'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a búsqueda
      </button>

      {/* Profile Header */}
      <div className="bg-surface rounded-3xl shadow-lg shadow-primary/10 border-2 border-transparent hover:border-primary/20 transition-all duration-300 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary to-accent rounded-3xl flex items-center justify-center text-surface text-2xl font-bold shadow-xl shadow-primary/30">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.bio && (
              <p className="mt-2 text-text-secondary max-w-2xl">{profile.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success/20 to-success-dark/20 rounded-full shadow-sm">
            <Award className="w-5 h-5 text-success" />
            <span className="font-bold text-success-dark">{Math.round(profile.trust_score)}/5.0</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-surface" />
            </div>
            <span className="text-xs">Tarifa/hora</span>
          </div>
          <p className="text-xl font-bold text-text-primary mt-2">${Math.round(profile.hourly_rate)}</p>
        </div>
        <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-surface" />
            </div>
            <span className="text-xs">Edades</span>
          </div>
          <p className="text-xl font-bold text-text-primary mt-2">{profile.min_children_age}-{profile.max_children_age} años</p>
        </div>
        <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-success to-success-dark rounded-xl flex items-center justify-center">
              <MapPin className="w-4 h-4 text-surface" />
            </div>
            <span className="text-xs">Radio</span>
          </div>
          <p className="text-xl font-bold text-text-primary mt-2">{profile.availability_radius_km} km</p>
        </div>
        <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
              <Languages className="w-4 h-4 text-surface" />
            </div>
            <span className="text-xs">Idiomas</span>
          </div>
          <p className="text-xl font-bold text-text-primary mt-2">{profile.languages_spoken.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Section */}
        <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Calendar className="w-6 h-6 text-surface" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Disponibilidad Semanal</h2>
              <p className="text-sm text-text-secondary">Horarios habituales del cuidador</p>
            </div>
          </div>

          {availability.length === 0 ? (
            <div className="text-center py-8 bg-bg-main rounded-2xl">
              <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">El cuidador aún no ha configurado su disponibilidad</p>
            </div>
          ) : (
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const dayAvailabilities = getAvailabilitiesForDay(day.value);
                const hasAvailabilities = dayAvailabilities.length > 0;

                return (
                  <div
                    key={day.value}
                    className={`rounded-2xl border-2 p-3 transition-all duration-300 ${
                      hasAvailabilities ? getDayBgGradient(day.value) : 'bg-bg-main border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${hasAvailabilities ? getDayGradient(day.value) : 'bg-border'} shadow-sm`} />
                      <span className="font-semibold text-text-primary w-24">{day.label}</span>
                      {hasAvailabilities ? (
                        <div className="flex flex-wrap gap-2">
                          {dayAvailabilities.map((avail) => (
                            <span
                              key={avail.id}
                              className="px-3 py-1 bg-surface rounded-xl text-sm font-semibold text-text-primary shadow-sm"
                            >
                              {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">No disponible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skills & Languages */}
        <div className="space-y-6">
          {/* Languages */}
          <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Languages className="w-6 h-6 text-surface" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Idiomas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.languages_spoken.map((lang) => (
                <span
                  key={lang}
                  className="px-4 py-2 bg-gradient-to-r from-bg-main to-bg-main hover:from-primary/10 hover:to-primary-light/10 text-text-primary rounded-xl text-sm font-semibold border-2 border-border hover:border-primary/30 transition-all duration-300"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-success/20 transition-all duration-300 shadow-lg shadow-success/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-success-dark rounded-2xl flex items-center justify-center shadow-lg shadow-success/20">
                  <Sparkles className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Habilidades</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-gradient-to-r from-success/10 to-success-dark/10 text-success-dark rounded-xl text-sm font-semibold border-2 border-success/20 hover:border-success/40 transition-all duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="mt-8">
        {showChat ? (
          <div className="bg-surface rounded-3xl border-2 border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Chat con {profile.first_name}</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Ocultar chat
              </button>
            </div>
            <Chat
              caregiverId={id}
              caregiverName={profile.first_name}
              conversationId={conversationId}
              onConversationCreated={(id) => setConversationId(id)}
            />
          </div>
        ) : (
          <button 
            onClick={() => setShowChat(true)}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-surface font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Contactar a {profile.first_name}
          </button>
        )}
      </div>
    </div>
  );
};

export default CaregiverDetail;
