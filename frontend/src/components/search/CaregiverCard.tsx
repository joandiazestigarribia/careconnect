import type { FC } from 'react';
import { type SearchResult } from '../../services/searchApi';
import { MapPin, DollarSign, Award, Users, Languages, Sparkles } from 'lucide-react';

interface Props {
  result: SearchResult;
}

const CaregiverCard: FC<Props> = ({ result }) => {
  const { caregiver, score, distance_km } = result;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-primary';
    return 'text-text-secondary';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-success/15';
    if (score >= 70) return 'bg-primary/10';
    return 'bg-bg-main';
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center text-surface text-xl font-bold shadow-sm">
              {caregiver.first_name[0]}{caregiver.last_name[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                {caregiver.first_name} {caregiver.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-sm text-text-secondary">{distance_km} km de distancia</span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${getScoreBg(score)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Match</div>
          </div>
        </div>

        {caregiver.bio && (
          <p className="mt-4 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {caregiver.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-xl">
            <DollarSign className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-text-muted">Tarifa</p>
              <p className="text-sm font-semibold text-text-primary">${caregiver.hourly_rate}/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-xl">
            <Award className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Trust</p>
              <p className="text-sm font-semibold text-text-primary">{caregiver.trust_score}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-bg-main rounded-xl">
            <Users className="w-4 h-4 text-success" />
            <div>
              <p className="text-xs text-text-muted">Edades</p>
              <p className="text-sm font-semibold text-text-primary">{caregiver.min_children_age}-{caregiver.max_children_age}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Idiomas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {caregiver.languages_spoken.map((lang) => (
              <span 
                key={lang} 
                className="px-2.5 py-1 bg-bg-main text-text-secondary text-xs font-medium rounded-lg border border-border"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {caregiver.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Habilidades</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {caregiver.skills.slice(0, 4).map((skill) => (
                <span 
                  key={skill} 
                  className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
              {caregiver.skills.length > 4 && (
                <span className="px-2.5 py-1 bg-bg-main text-text-muted text-xs font-medium rounded-lg">
                  +{caregiver.skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button className="w-full py-3 bg-primary text-surface font-medium rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn">
          <span>Ver Perfil Completo</span>
          <svg 
            className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" 
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
