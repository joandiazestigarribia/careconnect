import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { type FamilySearchResult } from '../../services/searchApi';
import { MapPin, Users, Languages, Heart, AlertCircle } from 'lucide-react';

interface Props {
  result: FamilySearchResult;
}

const FamilyCard: FC<Props> = ({ result }) => {
  const navigate = useNavigate();
  const { family, score, distance_km } = result;
  
  const avatarUrl = `https://i.pravatar.cc/150?u=${family.user_id}`;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-white';
    if (score >= 60) return 'text-white';
    return 'text-text-secondary';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'bg-linear-to-br from-success to-success-light';
    if (score >= 60) return 'bg-linear-to-br from-primary to-primary-light';
    return 'bg-bg-main border-2 border-border';
  };

  const getAgeRangeText = () => {
    if (!family.children_ages || family.children_ages.length === 0) {
      return 'Edades no especificadas';
    }
    const minAge = Math.min(...family.children_ages);
    const maxAge = Math.max(...family.children_ages);
    if (minAge === maxAge) {
      return `${minAge} año${minAge !== 1 ? 's' : ''}`;
    }
    return `${minAge}-${maxAge} años`;
  };

  return (
    <div className="bg-surface rounded-3xl shadow-lg shadow-primary/5 border-2 border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={avatarUrl}
              alt={`${family.family_name}`}
              className="w-14 h-14 rounded-full object-cover shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-14 h-14 bg-linear-to-br from-accent to-primary rounded-2xl flex items-center justify-center text-surface text-xl font-bold shadow-lg shadow-primary/20';
                  fallback.textContent = family.family_name.charAt(0).toUpperCase();
                  parent.prepend(fallback);
                }
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
                {family.family_name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-5 h-5 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-text-secondary">{distance_km} km de distancia</span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-lg ${getScoreGradient(score)} transition-all duration-300`}>
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${score >= 60 ? 'text-white/80' : 'text-text-muted'}`}>Match</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-2xl border border-border group-hover:border-primary/20 transition-all duration-300">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Hijos</p>
              <p className="text-sm font-bold text-text-primary">{family.children_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-2xl border border-border group-hover:border-accent/20 transition-all duration-300">
            <div className="w-8 h-8 bg-linear-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-md shadow-accent/20">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Edades</p>
              <p className="text-sm font-bold text-text-primary">{getAgeRangeText()}</p>
            </div>
          </div>
        </div>

        {family.languages_preferred && family.languages_preferred.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Languages className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Idiomas preferidos</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {family.languages_preferred.map((lang) => (
                <span 
                  key={lang} 
                  className="px-3 py-1.5 bg-bg-main text-text-secondary text-xs font-bold rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {family.special_needs && family.special_needs.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-linear-to-br from-warning to-warning/70 rounded-full flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Necesidades especiales</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {family.special_needs.slice(0, 3).map((need) => (
                <span 
                  key={need} 
                  className="px-3 py-1.5 bg-linear-to-r from-warning/10 to-warning/5 text-warning-dark text-xs font-bold rounded-xl border border-warning/20 hover:shadow-md hover:shadow-warning/10 transition-all duration-300"
                >
                  {need}
                </span>
              ))}
              {family.special_needs.length > 3 && (
                <span className="px-3 py-1.5 bg-bg-main text-text-muted text-xs font-bold rounded-xl border border-border">
                  +{family.special_needs.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button 
          onClick={() => navigate(`/family/${family.user_id}`)}
          className="w-full py-3.5 bg-linear-to-r from-primary to-primary-light text-surface font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <span>Ver Perfil de Familia</span>
          <svg 
            className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FamilyCard;
