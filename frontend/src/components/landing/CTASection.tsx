import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 bg-linear-to-br from-primary via-primary-dark to-accent relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">👶</div>
        <div className="absolute top-20 right-20 text-5xl opacity-10 animate-float-delayed">🎈</div>
        <div className="absolute bottom-20 left-1/4 text-4xl opacity-10 animate-bounce-soft">⭐</div>
        <div className="absolute bottom-10 right-1/3 text-6xl opacity-10 animate-float">🧸</div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full mb-8">
          <span className="text-sm font-bold text-white">
            ¡Tu cuidador ideal te espera!
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
          Encontrá el cuidador perfecto{' '}
          <span className="relative inline-block">
            <span className="relative z-10">para tu familia</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 10C75 2 225 2 298 10" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </h2>

        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Unite a cientos de familias que ya encontraron la ayuda que necesitan. 
          Registrarse es <span className="font-bold">gratis</span> y toma menos de 2 minutos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-10 py-5 bg-white text-primary font-bold text-lg rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-black/20"
          >
            ¡Crear cuenta gratis!
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all border-2 border-white/30"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>Sin tarjetas de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>Sin compromisos</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Cancelá cuando quieras</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
