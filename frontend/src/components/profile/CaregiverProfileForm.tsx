import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { caregiverProfileApi } from '../../services/profileApi';
import Toast from '../common/Toast';

const CaregiverProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    hourly_rate: 0,
    min_children_age: 0,
    max_children_age: 18,
    availability_radius_km: 5,
    languages_spoken: [] as string[],
    skills: [] as string[],
  });
  const [newLanguage, setNewLanguage] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['hourly_rate', 'min_children_age', 'max_children_age', 'availability_radius_km'].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData(prev => ({ ...prev, languages_spoken: [...prev.languages_spoken, newLanguage.trim()] }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({ ...prev, languages_spoken: prev.languages_spoken.filter((_, i) => i !== index) }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await caregiverProfileApi.create(formData);
      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Completar Perfil de Cuidador</h1>

      {showSuccess && (
        <Toast message="Perfil guardado correctamente" type="success" />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido</label>
            <input
              type="text"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Biografía</label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Cuéntanos sobre ti y tu experiencia..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tarifa por Hora ($)</label>
          <input
            type="number"
            name="hourly_rate"
            min="0"
            required
            value={formData.hourly_rate}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Edad Mínima de Niños</label>
            <input
              type="number"
              name="min_children_age"
              min="0"
              max="18"
              value={formData.min_children_age}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Edad Máxima de Niños</label>
            <input
              type="number"
              name="max_children_age"
              min="0"
              max="18"
              value={formData.max_children_age}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Radio de Disponibilidad (km)</label>
          <input
            type="number"
            name="availability_radius_km"
            min="1"
            max="100"
            value={formData.availability_radius_km}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Idiomas que Hablas</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Ej: Español, Inglés"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button type="button" onClick={addLanguage} className="px-4 py-2 bg-blue-600 text-white rounded-md">Agregar</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.languages_spoken.map((lang, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {lang}
                <button type="button" onClick={() => removeLanguage(index)} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Habilidades</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ej: Primeros auxilios, Cocina, Tareas"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-md">Agregar</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {skill}
                <button type="button" onClick={() => removeSkill(index)} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </form>
    </div>
  );
};

export default CaregiverProfileForm;
