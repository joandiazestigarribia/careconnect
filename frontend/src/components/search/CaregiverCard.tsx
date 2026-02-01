import React from 'react';
import { type SearchResult } from '../../services/searchApi';

interface Props {
  result: SearchResult;
}

const CaregiverCard: React.FC<Props> = ({ result }) => {
  const { caregiver, score, distance_km } = result;

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {caregiver.first_name} {caregiver.last_name}
          </h3>
          <p className="text-gray-600 text-sm mt-1">{caregiver.bio}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-xs text-gray-500">match score</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Tarifa:</span>
          <span className="ml-1 font-medium">${caregiver.hourly_rate}/h</span>
        </div>
        <div>
          <span className="text-gray-500">Distancia:</span>
          <span className="ml-1 font-medium">{distance_km} km</span>
        </div>
        <div>
          <span className="text-gray-500">Trust Score:</span>
          <span className="ml-1 font-medium">{caregiver.trust_score}/100</span>
        </div>
        <div>
          <span className="text-gray-500">Edades:</span>
          <span className="ml-1 font-medium">
            {caregiver.min_children_age}-{caregiver.max_children_age} años
          </span>
        </div>
      </div>

      <div className="mt-3">
        <span className="text-gray-500 text-sm">Idiomas:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {caregiver.languages_spoken.map((lang) => (
            <span key={lang} className="bg-gray-100 px-2 py-1 rounded text-xs">
              {lang}
            </span>
          ))}
        </div>
      </div>

      {caregiver.skills.length > 0 && (
        <div className="mt-3">
          <span className="text-gray-500 text-sm">Habilidades:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {caregiver.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
            {caregiver.skills.length > 4 && (
              <span className="text-gray-400 text-xs">+{caregiver.skills.length - 4}</span>
            )}
          </div>
        </div>
      )}

      <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
        Ver Perfil
      </button>
    </div>
  );
};

export default CaregiverCard;
