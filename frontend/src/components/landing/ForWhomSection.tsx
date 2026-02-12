const familyBenefits = [
  { title: 'Cuidadores verificados', description: 'Antecedentes chequeados y perfiles 100% reales.' },
  { title: 'Flexibilidad total', description: 'Encontrá cuidadores para cualquier horario que necesites.' },
  { title: 'Reseñas reales', description: 'Opiniones verificadas de familias que ya los contrataron.' },
  { title: 'Matches inteligentes', description: 'Nuestro algoritmo encuentra el cuidador ideal para vos.' },
];

const caregiverBenefits = [
  { title: 'Ganá dinero extra', description: 'Convertí tu pasión por los niños en ingresos flexibles.' },
  { title: 'Trabajá cerca de casa', description: 'Elegí familias en tu zona y ahorrá tiempo de traslado.' },
  { title: 'Construí tu reputación', description: 'Sumá reseñas y aumentá tu trust score para más oportunidades.' },
  { title: 'Crecé profesionalmente', description: 'Accedé a recursos y capacitaciones exclusivas.' },
];

const ForWhomSection = () => {
  return (
    <section id="para-quien" className="py-24 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-success/10 to-primary/10 rounded-full mb-6">
            <span className="text-sm font-bold text-text-primary">
              Para todos
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
            ¿Para quién es{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
              CareConnect
            </span>
            ?
          </h2>
          
          <p className="text-lg text-text-secondary">
            Una plataforma pensada tanto para familias que buscan el mejor cuidado, 
            como para cuidadores que quieren crecer profesionalmente.
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Families */}
          <div className="relative bg-linear-to-br from-bg-main to-white rounded-3xl p-8 lg:p-10 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-all group">

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-primary-dark mb-2">Para Familias</h3>
              <p className="text-text-secondary">Encontrá el cuidador ideal para tus pequeños</p>
            </div>

            <div className="space-y-4 mb-8">
              {familyBenefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border hover:border-primary/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">{benefit.title}</h4>
                    <p className="text-sm text-text-secondary">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/register?role=family"
              className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/30"
            >
              Registrarme como Familia
              <span className="ml-2">🏠</span>
            </a>
          </div>

          {/* For Caregivers */}
          <div className="relative bg-linear-to-br from-bg-main to-white rounded-3xl p-8 lg:p-10 shadow-xl border-2 border-accent/10 hover:border-accent/30 transition-all group">

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-accent-dark mb-2">Para Cuidadores</h3>
              <p className="text-text-secondary">Convertí tu pasión en un trabajo flexible</p>
            </div>

            <div className="space-y-4 mb-8">
              {caregiverBenefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border hover:border-accent/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">{benefit.title}</h4>
                    <p className="text-sm text-text-secondary">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/register?role=caregiver"
              className="btn btn-accent w-full py-4 text-base shadow-lg shadow-accent/30"
            >
              Registrarme como Cuidador
              <span className="ml-2">✨</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWhomSection;
