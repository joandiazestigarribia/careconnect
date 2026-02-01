import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { familyProfileApi } from '../../services/profileApi';
import Toast from '../common/Toast';

const FamilyProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    family_name: '',
    address: '',
    children_count: 1,
    children_ages: [] as number[],
    special_needs: [] as string[],
    languages_preferred: [] as string[],
  });
  const [newNeed, setNewNeed] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'children_count' ? parseInt(value) : value }));
  };

  const handleChildrenAgesChange = (index: number, value: string) => {
    const newAges = [...formData.children_ages];
    newAges[index] = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, children_ages: newAges }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children_count: prev.children_count + 1,
      children_ages: [...prev.children_ages, 0],
    }));
  };

  const removeChild = () => {
    if (formData.children_count > 1) {
      setFormData(prev => ({
        ...prev,
        children_count: prev.children_count - 1,
        children_ages: prev.children_ages.slice(0, -1),
      }));
    }
  };

  const addNeed = () => {
    if (newNeed.trim()) {
      setFormData(prev => ({ ...prev, special_needs: [...prev.special_needs, newNeed.trim()] }));
      setNewNeed('');
    }
  };

  const removeNeed = (index: number) => {
    setFormData(prev => ({ ...prev, special_needs: prev.special_needs.filter((_, i) => i !== index) }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData(prev => ({ ...prev, languages_preferred: [...prev.languages_preferred, newLanguage.trim()] }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({ ...prev, languages_preferred: prev.languages_preferred.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await familyProfileApi.create(formData);
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
      <h1 className="text-2xl font-bold mb-6">Completar Perfil de Familia</h1>

      {showSuccess && (
        <Toast message="Perfil guardado correctamente" type="success" />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre de la Familia</label>
          <input
            type="text"
            name="family_name"
            required
            value={formData.family_name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            placeholder="Calle, número, ciudad"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cantidad de Niños</label>
          <div className="flex items-center gap-4 mt-1">
            <button type="button" onClick={removeChild} className="px-3 py-1 bg-gray-200 rounded">-</button>
            <span>{formData.children_count}</span>
            <button type="button" onClick={addChild} className="px-3 py-1 bg-gray-200 rounded">+</button>
          </div>
        </div>

        {formData.children_count > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Edades de los Niños</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Array.from({ length: formData.children_count }).map((_, index) => (
                <input
                  key={index}
                  type="number"
                  min="0"
                  max="18"
                  placeholder={`Niño ${index + 1}`}
                  value={formData.children_ages[index] || ''}
                  onChange={(e) => handleChildrenAgesChange(index, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Necesidades Especiales</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newNeed}
              onChange={(e) => setNewNeed(e.target.value)}
              placeholder="Ej: Alergias, medicación, etc."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button type="button" onClick={addNeed} className="px-4 py-2 bg-blue-600 text-white rounded-md">Agregar</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.special_needs.map((need, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {need}
                <button type="button" onClick={() => removeNeed(index)} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Idiomas Preferidos</label>
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
            {formData.languages_preferred.map((lang, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {lang}
                <button type="button" onClick={() => removeLanguage(index)} className="text-red-500">×</button>
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

export default FamilyProfileForm;
