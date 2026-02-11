import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, MapPin } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-bg-main to-success/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">
                Conectamos familias con cuidadores de confianza
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                Cuidado infantil en el que{' '}
                <span className="text-primary">podés confiar</span>
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-xl">
                Encontrá el cuidador que mejor se adapte a tu familia. 
                En cualquier momento, en cualquier lugar.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-success-dark" />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">500+</p>
                  <p className="text-sm text-text-secondary">Familias</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">200+</p>
                  <p className="text-sm text-text-secondary">Cuidadores</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="btn btn-primary px-8 py-4 text-base group"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('como-funciona');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-secondary px-8 py-4 text-base"
              >
                Conocer más
              </button>
            </div>

            {/* Trust badges */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-muted mb-3">Con la confianza de familias en toda la región</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
                <span className="ml-2 text-sm font-medium text-text-primary">
                  4.9 de 5 estrellas
                </span>
              </div>
            </div>
          </div>

          {/* Right content - Illustration/Visual */}
          <div className="relative lg:pl-8">
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-primary/10 p-6 border border-border">
              {/* Mock Search Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">¿Dónde necesitás cuidado?</h3>
                    <p className="text-sm text-text-secondary">Buscá cuidadores cerca de tu ubicación</p>
                  </div>
                </div>

                {/* Mock input */}
                <div className="p-4 bg-bg-main rounded-xl border border-border">
                  <div className="flex items-center gap-3 text-text-secondary">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">Resistencia, Chaco</span>
                  </div>
                </div>

                {/* Mock results preview */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-text-secondary">Cuidadores disponibles</p>
                  
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-bg-main rounded-xl">
                      <div className="w-10 h-10 bg-primary/20 rounded-full" />
                      <div className="flex-1">
                        <div className="h-3 bg-primary/20 rounded w-24 mb-2" />
                        <div className="h-2 bg-border rounded w-16" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="text-sm font-medium">4.{8 + i}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full btn btn-primary py-3">
                  Buscar cuidadores
                </button>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-success-dark" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">+50 cuidadores nuevos</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 bg-primary/30 rounded-full border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-text-primary">Familias felices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
