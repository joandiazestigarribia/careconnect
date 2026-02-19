import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caregiverProfileApi, type CaregiverProfile } from '../services/profileApi';
import { availabilityApi, DAYS_OF_WEEK, type Availability, type DayOfWeek } from '../services/availabilityApi';
import { 
  MapPin, DollarSign, Award, Users, Languages, Sparkles, ArrowLeft, 
  Clock, Calendar, MessageSquare, Shield, BadgeCheck, Star, Phone, Mail,
  FileCheck, Baby, GraduationCap, Briefcase, Heart, Quote,
  Sunrise, Sun, Sunset, Moon, CheckCircle2
} from 'lucide-react';
import Chat from '../components/messages/Chat';

interface CaregiverProfileExtended extends CaregiverProfile {
  is_id_verified?: boolean;
  has_background_check?: boolean;
  background_check_date?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  response_rate?: number;
  avg_response_time?: string;
  last_active?: string;
  education_level?: string;
  education_details?: string;
  certifications?: string[];
  years_experience?: number;
  references?: Reference[];
}

interface Reference {
  id: string;
  author_name: string;
  content: string;
  date: string;
}

const TIME_SLOTS = [
  { key: 'morning', label: 'Mañana', icon: Sunrise, hours: '06:00-12:00' },
  { key: 'midday', label: 'Mediodía', icon: Sun, hours: '12:00-14:00' },
  { key: 'afternoon', label: 'Tarde', icon: Sunset, hours: '14:00-18:00' },
  { key: 'evening', label: 'Noche', icon: Moon, hours: '18:00-23:00' },
] as const;

const AGE_GROUPS = [
  { label: 'Bebé', range: '0-1', icon: Baby, min: 0, max: 1 },
  { label: 'Niño pequeño', range: '1-3', icon: Baby, min: 1, max: 3 },
  { label: 'Preescolar', range: '3-5', icon: Users, min: 3, max: 5 },
  { label: 'Primaria', range: '5-12', icon: GraduationCap, min: 5, max: 12 },
];

const CaregiverDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CaregiverProfileExtended | null>(null);
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
      setProfile({
        ...profileData,
        is_id_verified: true,
        has_background_check: profileData.trust_score > 4.0,
        background_check_date: '2024-02-19',
        phone_verified: true,
        email_verified: true,
        response_rate: 100,
        avg_response_time: '1 día',
        last_active: 'Hoy',
        education_level: 'Educación superior',
        education_details: 'Licenciatura en Psicología - Universidad de Buenos Aires',
        certifications: ['Primeros Auxilios', 'RCP Pediatrico', 'Cuidado Infantil'],
        years_experience: 8,
        references: [
          {
            id: '1',
            author_name: 'María G.',
            content: 'Cuidó a mi hija durante 6 meses. Excelente profesional, muy responsable y cariñosa. Mi hija la adoraba.',
            date: '2024-02-15',
          },
          {
            id: '2',
            author_name: 'Carlos R.',
            content: 'Muy buena experiencia. Siempre puntual y con mucha paciencia. Recomendada al 100%.',
            date: '2024-01-20',
          },
          {
            id: '3',
            author_name: 'Ana L.',
            content: 'Gran profesional. Tiene técnicas muy buenas para manejar situaciones difíciles con los niños.',
            date: '2023-12-10',
          },
        ],
      });
      setAvailability(availabilityData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const isTimeSlotAvailable = (day: DayOfWeek, slotKey: string): boolean => {
    const [slotStart, slotEnd] = getSlotHours(slotKey);
    const dayAvailabilities = availability.filter(a => a.day_of_week === day);
    
    return dayAvailabilities.some(avail => {
      return avail.start_time < slotEnd && avail.end_time > slotStart;
    });
  };

  const getSlotHours = (slotKey: string): [string, string] => {
    const slot = TIME_SLOTS.find(s => s.key === slotKey);
    if (!slot) return ['00:00', '00:00'];
    return slot.hours.split('-') as [string, string];
  };

  const getDayLabel = (dayValue: string): string => {
    const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
    return day?.label.substring(0, 3) || dayValue;
  };

  const getRelevantAgeGroups = (minAge: number, maxAge: number) => {
    return AGE_GROUPS.filter(group => 
      (minAge <= group.max && maxAge >= group.min)
    );
  };

  const isPopularCaregiver = (trustScore: number) => trustScore >= 4.5;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  };

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
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const ageGroups = getRelevantAgeGroups(profile.min_children_age, profile.max_children_age);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/dashboard', { state: { preserveFilters: true } })}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a búsqueda
      </button>

      {/* Profile Header con Badges de Verificación */}
      <div className="bg-surface rounded-3xl shadow-xl shadow-primary/15 border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="relative">
            <img 
              src={`https://i.pravatar.cc/150?u=${profile.user_id}`}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-36 h-36 rounded-full object-cover shadow-2xl shadow-primary/40"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-36 h-36 bg-linear-to-br from-primary via-primary to-accent rounded-full flex items-center justify-center text-surface text-4xl font-bold shadow-2xl shadow-primary/40 ring-4 ring-white';
                  fallback.textContent = `${profile.first_name[0]}${profile.last_name[0]}`;
                  parent.prepend(fallback);
                }
              }}
            />
            {isPopularCaregiver(profile.trust_score) && (
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-text-primary">
                {profile.first_name} {profile.last_name}
              </h1>
              {/* Badges de verificación principales */}
              {profile.is_id_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-100" title="Documento de identidad verificado">
                  <Shield className="w-3.5 h-3.5" />
                  Perfil Verificado
                </span>
              )}

            </div>
            
            {/* Fila de verificaciones secundarias */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-base text-text-secondary">
                <Award className="w-5 h-5 text-success" />
                <span className="font-semibold text-success-dark">{Math.round(profile.trust_score)}/5.0</span>
                <span className="text-text-muted">Trust Score</span>
              </div>
              {profile.has_background_check && (
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <FileCheck className="w-4 h-4 text-success" />
                  <span>Antecedentes verificados</span>
                </div>
              )}
              {profile.last_active && (
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>Actividad: {profile.last_active}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas: Contenido + Sidebar Sticky */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal - Ocupa 2/3 normalmente, o 3/3 cuando el chat está abierto */}
        <div className={`space-y-6 ${showChat ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          
          {/* Sobre Mí - Sección expandida */}
          {profile.bio && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Heart className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Sobre mí</h2>
              </div>
              <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </div>
            </div>
          )}

          {/* Experiencia con Edades */}
          <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                <Users className="w-6 h-6 text-surface" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Experiencia con edades</h2>
                <p className="text-sm text-text-secondary">{profile.min_children_age}-{profile.max_children_age} años</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGE_GROUPS.map((group) => {
                const isRelevant = ageGroups.some(g => g.label === group.label);
                return (
                  <div
                    key={group.label}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      isRelevant
                        ? 'bg-linear-to-br from-primary/10 to-accent/10 border-primary/30'
                        : 'bg-bg-main border-border opacity-50'
                    }`}
                  >
                    <group.icon className={`w-5 h-5 mb-2 ${isRelevant ? 'text-primary' : 'text-text-muted'}`} />
                    <p className={`font-semibold text-sm ${isRelevant ? 'text-text-primary' : 'text-text-muted'}`}>
                      {group.label}
                    </p>
                    <p className="text-xs text-text-muted">{group.range} años</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <div className="w-8 h-8 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-surface" />
                </div>
                <span className="text-xs">Tarifa/hora</span>
              </div>
              <p className="text-xl font-bold text-text-primary mt-2">${Math.round(profile.hourly_rate)}</p>
            </div>
            <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <div className="w-8 h-8 bg-linear-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-surface" />
                </div>
                <span className="text-xs">Experiencia</span>
              </div>
              <p className="text-xl font-bold text-text-primary mt-2">{profile.years_experience || 2}+ años</p>
            </div>
            <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <div className="w-8 h-8 bg-linear-to-br from-success to-success-dark rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-surface" />
                </div>
                <span className="text-xs">Radio</span>
              </div>
              <p className="text-xl font-bold text-text-primary mt-2">{profile.availability_radius_km} km</p>
            </div>
            <div className="bg-surface rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15 p-4">
              <div className="flex items-center gap-2 text-text-muted mb-1">
                <div className="w-8 h-8 bg-linear-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                  <Languages className="w-4 h-4 text-surface" />
                </div>
                <span className="text-xs">Idiomas</span>
              </div>
              <p className="text-xl font-bold text-text-primary mt-2">{profile.languages_spoken.length}</p>
            </div>
          </div>

          {/* Disponibilidad - Tabla tipo grilla */}
          <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
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
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  {/* Header con días */}
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="py-2"></div>
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="text-center py-2 text-sm font-semibold text-text-primary">
                        {getDayLabel(day.value)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Filas de franjas horarias */}
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.key} className="grid grid-cols-8 gap-1 items-center py-2 border-t border-border/30">
                      <div className="text-sm font-medium text-text-primary">{slot.label}</div>
                      {DAYS_OF_WEEK.map((day) => {
                        const isAvailable = isTimeSlotAvailable(day.value, slot.key);
                        return (
                          <div key={day.value} className="flex justify-center py-1">
                            {isAvailable ? (
                              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-bg-main border-2 border-border" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Educación y Certificaciones */}
          {(profile.education_level || (profile.certifications && profile.certifications.length > 0)) && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <GraduationCap className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Educación y Certificaciones</h2>
              </div>
              
              {profile.education_level && (
                <div className="mb-4">
                  <p className="font-semibold text-text-primary">{profile.education_level}</p>
                  {profile.education_details && (
                    <p className="text-sm text-text-secondary">{profile.education_details}</p>
                  )}
                </div>
              )}
              
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-4 py-2 bg-linear-to-r from-accent/10 to-primary/10 text-text-primary rounded-xl text-sm font-semibold border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 flex items-center gap-2"
                    >
                      <BadgeCheck className="w-4 h-4 text-accent" />
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Idiomas */}
          <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Languages className="w-6 h-6 text-surface" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Idiomas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.languages_spoken.map((lang) => (
                <span
                  key={lang}
                  className="px-4 py-2 bg-linear-to-r from-bg-main to-bg-main hover:from-primary/10 hover:to-primary-light/10 text-text-primary rounded-xl text-sm font-semibold border-2 border-border hover:border-primary/30 transition-all duration-300"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Habilidades */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-success/20 transition-all duration-300 shadow-lg shadow-success/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-success to-success-dark rounded-2xl flex items-center justify-center shadow-lg shadow-success/20">
                  <Sparkles className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Habilidades</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-linear-to-r from-success/10 to-success-dark/10 text-success-dark rounded-xl text-sm font-semibold border-2 border-success/20 hover:border-success/40 transition-all duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Referencias / Testimonios - Solo mostrar cuando el chat está cerrado */}
          {!showChat && profile.references && profile.references.length > 0 && (
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all duration-300 shadow-lg shadow-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <Quote className="w-6 h-6 text-surface" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Referencias</h2>
                <span className="px-2 py-1 bg-bg-main rounded-lg text-xs font-semibold text-text-muted">
                  {profile.references.length}
                </span>
              </div>
              <div className="space-y-4">
                {profile.references.map((ref, index) => (
                  <div
                    key={ref.id}
                    className={`p-4 rounded-2xl bg-linear-to-r from-bg-main to-bg-main/50 border border-border ${
                      index !== profile.references!.length - 1 ? 'border-b border-border pb-4' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary text-sm">
                          {ref.author_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-text-primary">{ref.author_name}</p>
                          <p className="text-xs text-text-muted">{formatDate(ref.date)}</p>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          "{ref.content}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Section - Ahora ocupa el espacio principal cuando está abierto */}
          {showChat && (
            <div className="bg-surface rounded-3xl border-2 border-border p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Chat con {profile.first_name}</h3>
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
                  caregiverName={profile.first_name}
                  conversationId={conversationId}
                  onConversationCreated={(id) => setConversationId(id)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Sticky (1/3) - Ocultar en desktop cuando el chat está abierto */}
        <div className={`lg:col-span-1 ${showChat ? 'hidden lg:hidden' : 'block'}`}>
          <div className="sticky top-20 space-y-4">
            {/* Tarjeta de Precio y CTA Principal */}
            <div className="bg-surface rounded-3xl border-2 border-primary/20 shadow-xl shadow-primary/10 p-6">
              <div className="text-center mb-6">
                <p className="text-text-muted text-sm mb-1">Tarifa por hora</p>
                <p className="text-4xl font-bold text-text-primary">${Math.round(profile.hourly_rate)}</p>
                <p className="text-text-muted text-sm">ARS / hora</p>
              </div>

              <button 
                onClick={() => setShowChat(true)}
                className="w-full py-4 bg-linear-to-r from-primary to-accent text-surface font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Contactar a {profile.first_name}
              </button>

              {/* Estadísticas de Actividad */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-text-primary mb-3 text-sm">Actividad</h4>
                <div className="space-y-3">
                  {profile.response_rate !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">Mensajes contestados</span>
                      </div>
                      <span className="font-semibold text-text-primary">{profile.response_rate}%</span>
                    </div>
                  )}
                  {profile.avg_response_time && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Tiempo de respuesta</span>
                      </div>
                      <span className="font-semibold text-text-primary">{profile.avg_response_time}</span>
                    </div>
                  )}
                  {profile.last_active && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-sm">Última actividad</span>
                      </div>
                      <span className="font-semibold text-text-primary">{profile.last_active}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta de Verificaciones */}
            <div className="bg-surface rounded-3xl border-2 border-transparent hover:border-success/20 transition-all duration-300 shadow-lg shadow-success/5 p-6">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                Verificaciones
              </h3>
              <div className="space-y-3">
                {profile.is_id_verified && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Documento de identidad</p>
                      <p className="text-xs text-text-muted">Verificado</p>
                    </div>
                  </div>
                )}
                {profile.has_background_check && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Antecedentes penales</p>
                      <p className="text-xs text-text-muted">
                        Certificado verificado
                        {profile.background_check_date && (
                          <span className="block text-xs">Emitido: {new Date(profile.background_check_date).toLocaleDateString('es-AR')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {profile.phone_verified && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Número de teléfono</p>
                      <p className="text-xs text-text-muted">Verificado</p>
                    </div>
                  </div>
                )}
                {profile.email_verified && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Correo electrónico</p>
                      <p className="text-xs text-text-muted">Verificado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverDetail;
