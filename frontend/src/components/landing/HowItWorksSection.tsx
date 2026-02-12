import { Search, MessageCircle, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: Search,
    title: 'Contanos qué necesitás',
    description: 'Completá tu perfil familiar: horarios, preferencias, idiomas y todo lo que sea importante para vos.',
    color: 'from-primary to-primary-dark',
    bgColor: 'bg-primary/10',
  },
  {
    number: '2',
    icon: MessageCircle,
    title: 'Recibí matches inteligentes',
    description: 'Nuestro algoritmo analiza y te muestra los cuidadores más compatibles con un puntaje de match.',
    color: 'from-accent to-accent-dark',
    bgColor: 'bg-accent/10',
  },
  {
    number: '3',
    icon: Calendar,
    title: 'Conectá y coordiná',
    description: 'Chateá, conocé al cuidador en una reunión introductoria y empezá cuando quieras. ¡Así de fácil!',
    color: 'from-success to-success-dark',
    bgColor: 'bg-success/10',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-bg-main relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
            <span className="text-sm font-bold text-text-primary">
              En 3 simples pasos
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
            ¿Cómo funciona?
          </h2>
          
          <p className="text-lg text-text-secondary">
            Dejá de buscar entre cientos de perfiles. Nosotros hacemos el trabajo pesado 
            y te mostramos solo los mejores matches.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connection arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full z-0">
                  <ArrowRight className="w-8 h-8 text-border" />
                </div>
              )}

              <div className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300 h-full group-hover:shadow-xl group-hover:-translate-y-1">
                {/* Step badge */}
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br from-warning to-warning-dark rounded-2xl shadow-lg flex items-center justify-center text-2xl font-black text-white transform rotate-12 group-hover:rotate-0 transition-transform">
                  {step.number}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>

                {/* Fun indicator */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-success-dark">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Gratis y sin compromiso!</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-white rounded-3xl shadow-lg">
            <span className="text-text-secondary">
              ¿Listo para encontrar tu cuidador ideal?
            </span>
            <a
              href="/register"
              className="btn btn-primary px-6 py-3 whitespace-nowrap"
            >
              ¡Crear cuenta gratis!
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
