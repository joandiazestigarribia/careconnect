import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { type SearchResult } from '../../services/searchApi';
import { MapPin, DollarSign, Award, Users, Languages, Sparkles } from 'lucide-react';

interface Props {
  result: SearchResult;
}

const CaregiverCard: FC<Props> = ({ result }) => {
  const navigate = useNavigate();
  const { caregiver, score, distance_km } = result;

  const avatarUrl = `https://i.pravatar.cc/150?u=${caregiver.user_id}`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-white';
    if (score >= 70) return 'text-white';
    return 'text-text-secondary';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'bg-linear-to-br from-success to-success-light';
    if (score >= 70) return 'bg-linear-to-br from-primary to-primary-light';
    return 'bg-bg-main border-2 border-border';
  };

  return (
    <div className="bg-surface rounded-3xl shadow-lg shadow-primary/5 border-2 border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={avatarUrl}
              alt={`${caregiver.first_name} ${caregiver.last_name}`}
              className="w-14 h-14 rounded-full object-cover shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-14 h-14 bg-linear-to-br from-accent to-primary rounded-2xl flex items-center justify-center text-surface text-xl font-bold shadow-lg shadow-primary/20';
                  fallback.textContent = `${caregiver.first_name[0]}${caregiver.last_name[0]}`;
                  parent.prepend(fallback);
                }
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
                {caregiver.first_name} {caregiver.last_name}
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
            <div className={`text-[10px] font-bold uppercase tracking-wider ${score >= 70 ? 'text-white/80' : 'text-text-muted'}`}>Match</div>
          </div>
        </div>

        {caregiver.bio && (
          <p className="mt-4 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {caregiver.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-2xl border border-border group-hover:border-primary/20 transition-all duration-300">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Tarifa</p>
              <p className="text-sm font-bold text-text-primary">${Math.round(caregiver.hourly_rate)}/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-2xl border border-border group-hover:border-accent/20 transition-all duration-300">
            <div className="w-8 h-8 bg-linear-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-md shadow-accent/20">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Trust</p>
              <p className="text-sm font-bold text-text-primary">{caregiver.trust_score}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-2xl border border-border group-hover:border-success/20 transition-all duration-300">
            <div className="w-8 h-8 bg-linear-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-md shadow-success/20">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Edades</p>
              <p className="text-sm font-bold text-text-primary">{caregiver.min_children_age}-{caregiver.max_children_age}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Languages className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Idiomas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {caregiver.languages_spoken.map((lang) => (
              <span 
                key={lang} 
                className="px-3 py-1.5 bg-bg-main text-text-secondary text-xs font-bold rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {caregiver.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-linear-to-br from-success to-accent rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Habilidades</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {caregiver.skills.slice(0, 4).map((skill) => (
                <span 
                  key={skill} 
                  className="px-3 py-1.5 bg-linear-to-r from-primary/10 to-primary/5 text-primary text-xs font-bold rounded-xl border border-primary/20 hover:shadow-md hover:shadow-primary/10 transition-all duration-300"
                >
                  {skill}
                </span>
              ))}
              {caregiver.skills.length > 4 && (
                <span className="px-3 py-1.5 bg-bg-main text-text-muted text-xs font-bold rounded-xl border border-border">
                  +{caregiver.skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button 
          onClick={() => navigate(`/caregiver/${caregiver.user_id}`)}
          className="w-full py-3.5 bg-linear-to-r from-primary to-primary-light text-surface font-bold rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <span>Ver Perfil Completo</span>
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

export default CaregiverCard;
