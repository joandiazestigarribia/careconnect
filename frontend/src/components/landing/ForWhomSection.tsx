import { Heart, Baby, GraduationCap, Clock, Shield, Wallet } from 'lucide-react';

const familyBenefits = [
  {
    icon: Baby,
    title: 'Cuidadores verificados',
    description: 'Todos los perfiles pasan por un proceso de verificación.',
  },
  {
    icon: Clock,
    title: 'Flexibilidad total',
    description: 'Encontrá cuidadores para cualquier horario que necesites.',
  },
  {
    icon: Shield,
    title: 'Reseñas reales',
    description: 'Leé opiniones de otras familias antes de decidir.',
  },
];

const caregiverBenefits = [
  {
    icon: Wallet,
    title: 'Ganá dinero extra',
    description: 'Convertí tu pasión por los niños en ingresos flexibles.',
  },
  {
    icon: MapPin,
    title: 'Trabajá cerca de casa',
    description: 'Elegí familias en tu zona para minimizar traslados.',
  },
  {
    icon: GraduationCap,
    title: 'Crecé profesionalmente',
    description: 'Accedé a recursos y capacitaciones exclusivas.',
  },
];

import { MapPin } from 'lucide-react';

const ForWhomSection = () => {
  return (
    <section className="py-24 bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-success/20 text-success-dark text-sm font-medium rounded-full mb-4">
            Para todos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            ¿Para quién es CareConnect?
          </h2>
          <p className="text-lg text-text-secondary">
            Una plataforma pensada tanto para familias que buscan cuidadores, 
            como para cuidadores que buscan oportunidades.
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Families */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Para Familias</h3>
                <p className="text-text-secondary">Encontrá el cuidador ideal</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {familyBenefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/register?role=family"
              className="btn btn-primary w-full py-3"
            >
              Registrarme como Familia
            </a>
          </div>

          {/* For Caregivers */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-accent-dark" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Para Cuidadores</h3>
                <p className="text-text-secondary">Convertí tu pasión en trabajo</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {caregiverBenefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/register?role=caregiver"
              className="btn btn-accent w-full py-3"
            >
              Registrarme como Cuidador
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWhomSection;
