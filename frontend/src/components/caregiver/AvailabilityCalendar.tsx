import { useState, useEffect } from 'react';
import { availabilityApi, DAYS_OF_WEEK, type DayOfWeek, type Availability } from '../../services/availabilityApi';
import { Clock, Plus, Trash2, X, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

const AvailabilityCalendar = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    setIsLoading(true);
    try {
      const data = await availabilityApi.getMyAvailability();
      setAvailabilities(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar disponibilidad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await availabilityApi.create({
        day_of_week: selectedDay,
        start_time: startTime,
        end_time: endTime,
        is_recurring: true,
      });
      await loadAvailabilities();
      setShowAddForm(false);
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al guardar disponibilidad');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;
    
    setIsSaving(true);
    try {
      await availabilityApi.delete(id);
      await loadAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al eliminar');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvailabilitiesForDay = (day: DayOfWeek) => {
    return availabilities
      .filter(a => a.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary hover:text-surface transition-all"
        >
          <Plus className="w-5 h-5" />
          Agregar Disponibilidad
        </button>
      )}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-bg-main rounded-xl border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Nuevo Horario
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Día de la semana</label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setSelectedDay(day.value)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDay === day.value
                      ? 'bg-primary text-surface'
                      : 'bg-surface text-text-secondary hover:bg-border'
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Inicio</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Fin</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 px-4 bg-surface text-text-primary font-medium rounded-xl hover:bg-border transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 px-4 bg-primary text-surface font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* Weekly Schedule */}
      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day) => {
          const dayAvailabilities = getAvailabilitiesForDay(day.value);
          const isExpanded = expandedDay === day.value;
          const hasAvailabilities = dayAvailabilities.length > 0;

          return (
            <div
              key={day.value}
              className={`rounded-xl border transition-all ${
                hasAvailabilities ? 'bg-blue-50 border-blue-200' : 'bg-surface border-border'
              }`}
            >
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.value)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${hasAvailabilities ? 'bg-blue-500' : 'bg-border'}`} />
                  <span className="font-medium text-text-primary">{day.label}</span>
                  {hasAvailabilities && (
                    <span className="text-xs text-text-secondary">
                      ({dayAvailabilities.length} horario{dayAvailabilities.length > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {dayAvailabilities.length === 0 ? (
                    <p className="text-sm text-text-secondary py-2">Sin horarios configurados</p>
                  ) : (
                    dayAvailabilities.map((avail) => (
                      <div
                        key={avail.id}
                        className="flex items-center justify-between p-3 bg-surface rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-text-muted" />
                          <span className="text-sm font-medium text-text-primary">
                            {formatTime(avail.start_time)} - {formatTime(avail.end_time)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(avail.id)}
                          disabled={isSaving}
                          className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {availabilities.length > 0 && (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-primary">{availabilities.length}</span> horario{availabilities.length > 1 ? 's' : ''} configurado{availabilities.length > 1 ? 's' : ''} esta semana
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
