import { Search, MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Buscá',
    description: 'Filtrá según tus necesidades: ubicación, disponibilidad, experiencia y más. Revisá perfiles detallados con reseñas verificadas.',
    color: 'bg-primary/10 text-primary',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Contactá',
    description: 'Envía mensajes gratuitos, evaluá a los miembros y coordiná una reunión introductoria para conocerse mejor.',
    color: 'bg-accent/10 text-accent-dark',
  },
  {
    number: '03',
    icon: Calendar,
    title: 'Coordiná',
    description: 'Acordá los horarios, tarifas y detalles del cuidado. ¡Todo de forma flexible y transparente!',
    color: 'bg-success/20 text-success-dark',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Proceso simple
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Encontrá un cuidador fácil y rápido
          </h2>
          <p className="text-lg text-text-secondary">
            En solo 3 pasos podés conectar con el cuidador ideal para tu familia
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-border">
                  <div className="absolute inset-0 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </div>
              )}

              <div className="relative bg-bg-main rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
                {/* Step number */}
                <span className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-sm font-bold text-primary border border-border">
                  {step.number}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${step.color}`}>
                  <step.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>

                {/* Check indicator */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-success-dark">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Gratis y sin compromiso</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-text-secondary mb-4">
            ¿Listo para encontrar tu cuidador ideal?
          </p>
          <a
            href="/register"
            className="btn btn-primary px-8 py-3"
          >
            Crear cuenta gratuita
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
