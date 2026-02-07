import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caregiverProfileApi, type CaregiverProfile } from '../services/profileApi';
import { availabilityApi, DAYS_OF_WEEK, type Availability, type DayOfWeek } from '../services/availabilityApi';
import { MapPin, DollarSign, Award, Users, Languages, Sparkles, ArrowLeft, Clock, Calendar } from 'lucide-react';

const CaregiverDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getDayColor = (day: DayOfWeek) => {
    const colors: Record<DayOfWeek, string> = {
      monday: 'bg-blue-500',
      tuesday: 'bg-indigo-500',
      wednesday: 'bg-purple-500',
      thursday: 'bg-pink-500',
      friday: 'bg-rose-500',
      saturday: 'bg-orange-500',
      sunday: 'bg-emerald-500',
    };
    return colors[day];
  };

  const getDayBgColor = (day: DayOfWeek) => {
    const colors: Record<DayOfWeek, string> = {
      monday: 'bg-blue-50 border-blue-200',
      tuesday: 'bg-indigo-50 border-indigo-200',
      wednesday: 'bg-purple-50 border-purple-200',
      thursday: 'bg-pink-50 border-pink-200',
      friday: 'bg-rose-50 border-rose-200',
      saturday: 'bg-orange-50 border-orange-200',
      sunday: 'bg-emerald-50 border-emerald-200',
    };
    return colors[day];
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
        <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
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
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-surface text-2xl font-bold shadow-lg">
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
          <div className="flex items-center gap-2 px-4 py-2 bg-success/15 rounded-full">
            <Award className="w-5 h-5 text-success" />
            <span className="font-semibold text-success-dark">{Math.round(profile.trust_score)}/5.0</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Tarifa/hora</span>
          </div>
          <p className="text-xl font-bold text-text-primary">${Math.round(profile.hourly_rate)}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Edades</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{profile.min_children_age}-{profile.max_children_age} años</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">Radio</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{profile.availability_radius_km} km</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Languages className="w-4 h-4" />
            <span className="text-xs">Idiomas</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{profile.languages_spoken.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Section */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Disponibilidad Semanal</h2>
              <p className="text-sm text-text-secondary">Horarios habituales del cuidador</p>
            </div>
          </div>

          {availability.length === 0 ? (
            <div className="text-center py-8 bg-bg-main rounded-xl">
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
                    className={`rounded-xl border p-3 ${
                      hasAvailabilities ? getDayBgColor(day.value) : 'bg-bg-main border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${hasAvailabilities ? getDayColor(day.value) : 'bg-border'}`} />
                      <span className="font-medium text-text-primary w-24">{day.label}</span>
                      {hasAvailabilities ? (
                        <div className="flex flex-wrap gap-2">
                          {dayAvailabilities.map((avail) => (
                            <span
                              key={avail.id}
                              className="px-2 py-1 bg-surface rounded-lg text-sm font-medium text-text-primary"
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
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">Idiomas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.languages_spoken.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 bg-bg-main text-text-primary rounded-lg text-sm font-medium border border-border"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-success" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Habilidades</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-success/10 text-success-dark rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Button */}
      <div className="mt-8">
        <button className="w-full py-4 bg-primary text-surface font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl">
          Contactar a {profile.first_name}
        </button>
      </div>
    </div>
  );
};

export default CaregiverDetail;
