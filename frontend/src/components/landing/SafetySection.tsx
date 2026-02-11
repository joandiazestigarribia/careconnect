import { Shield, UserCheck, MessageSquare, FileCheck, Lock } from 'lucide-react';

const safetyFeatures = [
  {
    icon: UserCheck,
    title: 'Verificación de identidad',
    description: 'Todos los miembros deben verificar su identidad con documentación válida antes de poder contactar a otros usuarios.',
  },
  {
    icon: MessageSquare,
    title: 'Monitoreo de comunicaciones',
    description: 'Revisamos perfiles y mensajes para detectar comportamientos sospechosos y mantener la comunidad segura.',
  },
  {
    icon: FileCheck,
    title: 'Reseñas verificadas',
    description: 'Solo las familias que han contratado a un cuidador pueden dejar reseñas, garantizando opiniones reales.',
  },
  {
    icon: Lock,
    title: 'Datos protegidos',
    description: 'Tu información personal está encriptada y nunca compartimos tus datos con terceros sin tu consentimiento.',
  },
];

const SafetySection = () => {
  return (
    <section id="seguridad" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-success/20 text-success-dark text-sm font-medium rounded-full mb-6">
              <Shield className="w-4 h-4" />
              Seguridad primero
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
              Con los chicos, la seguridad siempre es lo primero
            </h2>
            
            <p className="text-lg text-text-secondary mb-8">
              Por eso implementamos múltiples capas de seguridad para que tanto 
              familias como cuidadores puedan confiar en nuestra plataforma.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-bg-main rounded-xl">
                <p className="text-3xl font-bold text-primary mb-1">100%</p>
                <p className="text-sm text-text-secondary">Perfiles verificados</p>
              </div>
              <div className="p-4 bg-bg-main rounded-xl">
                <p className="text-3xl font-bold text-primary mb-1">0</p>
                <p className="text-sm text-text-secondary">Incidentes reportados</p>
              </div>
            </div>
          </div>

          {/* Right - Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {safetyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-bg-main rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
