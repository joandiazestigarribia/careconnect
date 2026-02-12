import { Target, Heart, Shield, Zap, Star, CheckCircle2, Sparkles } from 'lucide-react';

const scoringFactors = [
  {
    icon: Heart,
    title: 'Preferencias de la familia',
    description: 'Tipo de cuidado, horarios, idiomas y habilidades específicas que necesitás.',
    color: 'from-accent to-accent-dark',
    bgColor: 'bg-accent/10',
  },
  {
    icon: MapPin,
    title: 'Distancia y disponibilidad',
    description: 'Cercanía geográfica y coincidencia de horarios con tu familia.',
    color: 'from-primary to-primary-dark',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Trust Score',
    description: 'Verificación de antecedentes, reseñas y experiencia previa.',
    color: 'from-success to-success-dark',
    bgColor: 'bg-success/10',
  },
  {
    icon: Star,
    title: 'Calificaciones',
    description: 'Opiniones reales de otras familias que trabajaron con el cuidador.',
    color: 'from-warning to-warning-dark',
    bgColor: 'bg-warning/10',
  },
];

import { MapPin } from 'lucide-react';

const exampleMatches = [
  { score: 96, label: '¡Match perfecto!', color: 'bg-success' },
  { score: 82, label: 'Muy compatible', color: 'bg-primary' },
  { score: 65, label: 'Compatible', color: 'bg-warning' },
];

const ScoringSection = () => {
  return (
    <section id="scoring" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-warning/10 to-accent/10 rounded-full mb-6">
            <span className="text-sm font-bold text-text-primary">
              Nuestro diferenciador
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-6">
            Sistema de{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-warning">
                Scoring Inteligente
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C75 2 225 2 298 10" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          
          <p className="text-lg text-text-secondary">
            No te mostramos solo una lista de cuidadores. Nuestro algoritmo analiza 
            múltiples factores para encontrar el <span className="font-bold text-primary">match perfecto</span> para tu familia. 
            Es como tener un asistente personal buscando por vos
          </p>
        </div>

        {/* How it works visualization */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left - Factors */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              ¿Qué analizamos?
            </h3>
            
            {scoringFactors.map((factor, index) => (
              <div
                key={factor.title}
                className="flex items-start gap-4 p-5 bg-bg-main rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all group"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary mb-1 flex items-center gap-2">
                    {factor.title}
                    <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary to-accent text-white rounded-full">
                      +{20 - index * 5} pts
                    </span>
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Score examples */}
          <div className="relative">
            <div className="bg-gradient-to-br from-bg-main to-white rounded-3xl p-8 border-2 border-border">
              <h3 className="text-xl font-bold text-text-primary mb-6 text-center">
                Ejemplos de Match
              </h3>

              <div className="space-y-4">
                {exampleMatches.map((match) => (
                  <div
                    key={match.score}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-lg border border-border"
                  >
                    {/* Score circle */}
                    <div className={`w-16 h-16 ${match.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-black text-white">{match.score}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{match.label}</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2 mt-2">
                        <div 
                          className={`h-full rounded-full ${match.color} transition-all duration-1000`}
                          style={{ width: `${match.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fun fact */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-bold text-text-primary text-sm">¿Sabías que?</p>
                    <p className="text-sm text-text-secondary">
                      Las familias que usan nuestro scoring tienen un <span className="font-bold text-primary">98% de satisfacción</span> vs. 
                      el 70% en plataformas tradicionales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoringSection;
