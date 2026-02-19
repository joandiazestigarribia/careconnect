import { Shield, UserCheck, MessageSquare, FileCheck, Lock } from 'lucide-react';

const safetyFeatures = [
  {
    icon: UserCheck,
    emoji: '🆔',
    title: 'Verificación de identidad',
    description: 'Todos los miembros verifican su identidad con documentación válida antes de poder contactar.',
  },
  {
    icon: MessageSquare,
    emoji: '💬',
    title: 'Chat seguro',
    description: 'Comunicación monitoreada dentro de la plataforma. Sin compartir datos personales.',
  },
  {
    icon: FileCheck,
    emoji: '📋',
    title: 'Antecedentes chequeados',
    description: 'Verificamos los antecedentes penales de todos los cuidadores activos.',
  },
  {
    icon: Lock,
    emoji: '🔒',
    title: 'Datos protegidos',
    description: 'Tu información está encriptada y nunca la vendemos a terceros.',
  },
];

const SafetySection = () => {
  return (
    <section id="seguridad" className="py-24 bg-linear-to-br from-bg-main via-white to-bg-main relative overflow-hidden">
      {/* Decorative shields */}
      <div className="absolute top-20 right-10 text-8xl opacity-10">🛡️</div>
      <div className="absolute bottom-20 left-10 text-8xl opacity-10">🔒</div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-success/10 to-success/20 rounded-full mb-6">
              <Shield className="w-5 h-5 text-success-dark" />
              <span className="text-sm font-bold text-success-dark">
                Tu seguridad primero
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-6">
              Con los chicos,{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-success to-primary">
                la seguridad
              </span>{' '}
              siempre es lo primero
            </h2>
            
            <p className="text-lg text-text-secondary mb-8">
              Implementamos múltiples capas de seguridad para que tanto familias 
              como cuidadores puedan confiar en nuestra plataforma.{' '}
              <span className="font-bold text-primary">Tu tranquilidad es nuestra prioridad.</span>
            </p>

            {/* Trust stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-2xl shadow-lg border-2 border-success/20">
                <div className="text-3xl mb-2">100%</div>
                <div className="text-sm font-bold text-text-secondary">Perfiles verificados</div>
              </div>
              <div className="p-5 bg-white rounded-2xl shadow-lg border-2 border-primary/20">
                <div className="text-3xl mb-2">0</div>
                <div className="text-sm font-bold text-text-secondary">Incidentes reportados</div>
              </div>
            </div>
          </div>

          {/* Right - Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {safetyFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-success/30 transition-all group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-linear-to-br from-success/10 to-success/20 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.emoji}
                </div>
                <h3 className="font-bold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white rounded-full shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <div className="text-left">
                <p className="font-bold text-text-primary">Verificado por familias</p>
                <p className="text-sm text-text-secondary">+500 familias confían en nosotros</p>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-warning text-xl">⭐</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
