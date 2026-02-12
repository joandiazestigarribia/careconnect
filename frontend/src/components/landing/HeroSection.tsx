import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-success/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">

            {/* Playful headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight">
                Encontrá el cuidador{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    perfecto
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                para tu familia
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-xl">
                A través del <span className="font-bold">scoring</span>, nuestro sistema de <span className="font-bold text-primary">matching inteligente</span>, 
                encontrar al cuidador ideal es rápido, fácil y hasta divertido 🎉
              </p>
            </div>

            {/* Fun stats with emojis */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg shadow-primary/10 border border-primary/10">
                <div>
                  <p className="text-xl font-bold text-text-primary">500+</p>
                  <p className="text-sm text-text-secondary">Familias felices</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg shadow-accent/10 border border-accent/10">
                <div>
                  <p className="text-xl font-bold text-text-primary">200+</p>
                  <p className="text-sm text-text-secondary">Cuidadores</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg shadow-success/10 border border-success/10">
                <div>
                  <p className="text-xl font-bold text-text-primary">98%</p>
                  <p className="text-sm text-text-secondary">Match exitoso</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="btn btn-primary px-8 py-4 text-base group text-lg"
              >
                ¡Empezar ahora!
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('scoring');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-secondary px-8 py-4 text-base flex items-center gap-2"
              >
                <Zap className="w-5 h-5 text-warning" />
                Conocer el scoring
              </button>
            </div>
          </div>

          {/* Right content - Fun visual */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-primary/20 p-6 border-2 border-primary/10 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                {/* Score card preview */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-dashed border-border">
                  <div className="w-16 h-16 bg-gradient-to-br from-success to-success-dark rounded-2xl flex items-center justify-center shadow-lg animate-pulse-soft">
                    <span className="text-3xl font-black text-white">94</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-text-primary">¡Super Match!</span>
                    </div>
                    <p className="text-sm text-text-secondary">María es ideal para tu familia</p>
                  </div>
                </div>

                {/* Mock profile */}
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="https://i.pravatar.cc/150?img=32" 
                    alt="Lucrecia M." 
                    className="w-14 h-14 rounded-full shadow-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">Lucrecia M.</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-text-secondary">Cuidadora certificada</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <span className="font-bold">4.9</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['👶 Bebés', '🎨 Creativa', '🇬🇧 Inglés', '🍎 Cocina'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1.5 bg-bg-main rounded-xl text-sm font-medium text-text-secondary border border-border hover:border-primary/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
                  ¡Contactar ahora!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
